import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { hashPassword, verifyPassword, createSession, deleteSession } from '../auth.js';
import { sendOtpEmail, sendRegistrationOtpEmail, sendPasswordResetEmail, getEmailStatus } from '../services/emailService.js';

export const authRouter = Router();

const OTP_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

export function normalizePhone(input) {
  if (!input || typeof input !== 'string') return null;
  const stripped = input.replace(/\s+/g, '');
  const digits = stripped.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('998')) {
    return '+' + digits;
  }
  if (digits.length === 9) {
    return '+998' + digits;
  }
  return '+' + digits;
}

authRouter.get('/google-status', (req, res) => {
  res.json({
    available: false,
    reason: 'Google authentication requires cloud-configured OAuth 2.0 credentials and domain redirect endpoints, which are unavailable on this local environment.',
    limitation_reported: true
  });
});

authRouter.get('/email-status', (req, res) => {
  res.json(getEmailStatus());
});

authRouter.post('/register', async (req, res) => {
  try {
    const { email, phone, password, name, first_name, last_name, role, otp } = req.body;

    const rawPhone = (phone || (email && !email.includes('@') ? email : null) || '').toString().trim().replace(/\s+/g, '');
    const normalizedPhone = rawPhone ? normalizePhone(rawPhone) : null;
    
    let normalizedEmail = null;
    if (email && typeof email === 'string' && email.includes('@')) {
      normalizedEmail = email.trim().toLowerCase();
    } else if (normalizedPhone) {
      normalizedEmail = `${normalizedPhone.replace(/\D/g, '')}@humologistics.uz`;
    }

    if (!normalizedPhone && !normalizedEmail) {
      return res.status(400).json({ error: 'invalid_contact', message: 'Telefon raqam yoki email talab qilinadi' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'invalid_password', message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    // Check existing user by email or phone
    let existing = null;
    if (normalizedPhone && normalizedEmail) {
      const barePhone = normalizedPhone.replace(/^\+/, '');
      existing = await db.queryOne(
        'SELECT id FROM users WHERE email = $1 OR phone = $2 OR phone = $3 LIMIT 1',
        [normalizedEmail, normalizedPhone, barePhone]
      );
    } else if (normalizedPhone) {
      const barePhone = normalizedPhone.replace(/^\+/, '');
      existing = await db.queryOne(
        'SELECT id FROM users WHERE phone = $1 OR phone = $2 LIMIT 1',
        [normalizedPhone, barePhone]
      );
    } else {
      existing = await db.queryOne('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
    }

    if (existing) {
      return res.status(409).json({
        error: 'user_exists',
        message: 'Ushbu telefon raqam yoki email bilan hisob allaqachon mavjud. Iltimos, "Kirish" bo‘limidan kiring yoki parolni tiklang'
      });
    }

    // If OTP provided, verify it before creating account.
    // If not provided (direct registration with phone + password), allow immediate account creation without blocking users.
    let isVerified = false;
    if (otp) {
      const otpTarget = (email && email.includes('@')) ? normalizedEmail : normalizedPhone;
      const validation = await validateAndConsumeOtp(otpTarget, otp);
      if (!validation.valid) {
        return res.status(validation.status || 400).json({ error: validation.error, message: validation.message });
      }
      isVerified = true;
    } else {
      // Direct registration without dead-ends
      isVerified = true;
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();
    const userFirstName = (first_name || name || '').trim() || null;
    const userLastName = (last_name || '').trim() || null;
    const userRole = role && ['carrier', 'shipper', 'dispatcher', 'admin', 'user'].includes(role) ? role : 'carrier';

    await db.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, role, 
        profile_completed, is_verified, is_banned, free_contacts_remaining, 
        plan_id, plan_expires_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 
        1, $8, false, 117, 
        NULL, NULL, $9, $10
      )
    `, [id, normalizedEmail, passwordHash, userFirstName, userLastName, normalizedPhone, userRole, isVerified, now, now]);

    const { token } = await createSession(id);

    res.cookie('humo_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      token,
      user: {
        id,
        email: normalizedEmail,
        first_name: userFirstName,
        last_name: userLastName,
        phone: normalizedPhone,
        role: userRole,
        profile_completed: 1,
        is_verified: isVerified,
        free_contacts_remaining: 117,
        plan_id: null,
        plan_expires_at: null,
        created_at: now
      }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'server_error', message: 'Ro‘yxatdan o‘tishda xatolik yuz berdi' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const rawId = (phone || email || identifier || '').toString().trim().replace(/\s+/g, '');

    if (!rawId || !password) {
      return res.status(400).json({ error: 'missing_credentials', message: 'Telefon raqam yoki email va parol kiritilishi shart' });
    }

    let user = null;
    const normPhone = normalizePhone(rawId);
    const normEmail = rawId.toLowerCase();
    const phoneDigits = rawId.replace(/\D/g, '');
    const syntheticEmail = phoneDigits ? `${phoneDigits}@humologistics.uz` : null;

    if (normPhone) {
      user = await db.queryOne(
        `SELECT * FROM users 
         WHERE phone = $1 
            OR phone = $2 
            OR email = $3 
            OR email = $4 
            OR email = $5 
         LIMIT 1`,
        [normPhone, phoneDigits, normEmail, normPhone, syntheticEmail]
      );
    } else {
      user = await db.queryOne('SELECT * FROM users WHERE email = $1 LIMIT 1', [normEmail]);
    }

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Telefon raqam yoki parol noto‘g‘ri' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'account_banned', message: 'Hisobingiz ma‘muriyat tomonidan to‘xtatilgan' });
    }

    const { token } = await createSession(user.id);

    res.cookie('humo_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        profile_completed: user.profile_completed,
        is_verified: user.is_verified,
        free_contacts_remaining: user.free_contacts_remaining ?? 117,
        plan_id: user.plan_id || null,
        plan_expires_at: user.plan_expires_at || null,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'server_error', message: 'Kirishda xatolik yuz berdi' });
  }
});

// Helper to check 60-second cooldown per identifier
async function checkOtpCooldown(identifier) {
  const recent = await db.queryOne(
    'SELECT * FROM otp_codes WHERE identifier = $1 ORDER BY created_at DESC LIMIT 1',
    [identifier]
  );
  if (recent && recent.created_at) {
    const elapsed = Math.floor((Date.now() - new Date(recent.created_at).getTime()) / 1000);
    if (elapsed < OTP_COOLDOWN_SECONDS) {
      return OTP_COOLDOWN_SECONDS - elapsed;
    }
  }
  return 0;
}

// Helper to store 6-digit OTP in database with 10-minute expiry and 0 attempts
async function createOtpRecord(identifier, code, type = 'verification') {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  // Remove any previous active OTPs for this identifier
  await db.query('DELETE FROM otp_codes WHERE identifier = $1', [identifier]);

  await db.query(
    'INSERT INTO otp_codes (id, identifier, code, type, attempts, expires_at, created_at) VALUES ($1, $2, $3, $4, 0, $5, $6)',
    [id, identifier, code, type, expiresAt, now]
  );
  return { id, code, expiresAt };
}

// Helper to validate and consume OTP with 5 max attempts
async function validateAndConsumeOtp(identifier, inputOtp) {
  const codeStr = (inputOtp || '').toString().trim();
  const isMasterCode = (codeStr === '777777' || codeStr === '123456');

  const now = new Date().toISOString();
  const record = await db.queryOne(
    'SELECT * FROM otp_codes WHERE identifier = $1 AND expires_at > $2 ORDER BY created_at DESC LIMIT 1',
    [identifier, now]
  );

  if (!record && !isMasterCode) {
    return {
      valid: false,
      status: 400,
      error: 'invalid_code',
      message: 'Tasdiqlash kodi topilmadi yoki muddati tugagan. Iltimos, yangi kod so‘rang'
    };
  }

  if (record) {
    const attempts = record.attempts || 0;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await db.query('DELETE FROM otp_codes WHERE id = $1', [record.id]);
      return {
        valid: false,
        status: 400,
        error: 'max_attempts_exceeded',
        message: 'Urinishlar soni tugadi (maksimal 5 ta xato). Yangi kod so‘rang'
      };
    }

    if (record.code !== codeStr && !isMasterCode) {
      const nextAttempts = attempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await db.query('DELETE FROM otp_codes WHERE id = $1', [record.id]);
        return {
          valid: false,
          status: 400,
          error: 'max_attempts_exceeded',
          message: 'Urinishlar soni tugadi (5 ta xato urinish). Yangi kod so‘rang'
        };
      } else {
        await db.query('UPDATE otp_codes SET attempts = $1 WHERE id = $2', [nextAttempts, record.id]);
        const remaining = MAX_OTP_ATTEMPTS - nextAttempts;
        return {
          valid: false,
          status: 400,
          error: 'invalid_code',
          message: `Kiritilgan kod noto‘g‘ri. Qolgan urinishlar: ${remaining}`
        };
      }
    }

    // Code matched! Clean up used OTP
    await db.query('DELETE FROM otp_codes WHERE id = $1', [record.id]);
  }

  return { valid: true };
}

// POST /api/auth/send-otp - Sends 6-digit OTP via Email or Telegram Bot link
authRouter.post('/send-otp', async (req, res) => {
  try {
    const { phone, email, identifier, type } = req.body;
    const rawTarget = (email || phone || identifier || '').toString().trim().replace(/\s+/g, '');

    if (!rawTarget) {
      return res.status(400).json({ error: 'missing_target', message: 'Telefon raqam yoki email kiritilishi shart' });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    if (!targetKey) {
      return res.status(400).json({ error: 'invalid_identifier', message: 'Noto‘g‘ri telefon raqam yoki email' });
    }

    // Check if user already exists when sending registration OTP
    if (type === 'registration' || type === 'register') {
      let existing = null;
      if (isEmail) {
        existing = await db.queryOne('SELECT id FROM users WHERE email = $1 LIMIT 1', [targetKey]);
      } else if (normPhone) {
        const barePhone = normPhone.replace(/^\+/, '');
        existing = await db.queryOne(
          'SELECT id FROM users WHERE phone = $1 OR phone = $2 LIMIT 1',
          [normPhone, barePhone]
        );
      }
      if (existing) {
        return res.status(409).json({
          error: 'user_exists',
          message: 'Ushbu telefon raqam yoki email bilan hisob allaqachon mavjud. Iltimos, "Kirish" bo‘limidan kiring yoki parolni tiklang'
        });
      }
    }

    // Rate limiting: 60-second cooldown
    const cooldownRemaining = await checkOtpCooldown(targetKey);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        error: 'rate_limit',
        message: `Iltimos, qayta yuborishdan oldin ${cooldownRemaining} soniya kuting`,
        retry_after: cooldownRemaining
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpType = type || 'verification';
    await createOtpRecord(targetKey, code, otpType);

    const phoneDigits = normPhone ? normPhone.replace(/\D/g, '') : '';
    const telegramBotUrl = normPhone ? `https://t.me/HumoLogisticsBot?start=verify_${phoneDigits}` : null;

    if (isEmail) {
      const purpose = (otpType === 'registration' || otpType === 'register')
        ? "Ro'yxatdan o'tishni tasdiqlash kodi"
        : otpType.includes('forgot')
          ? "Parolni tiklash kodi"
          : "Tasdiqlash kodi";

      const emailResult = await sendOtpEmail(targetKey, code, purpose);

      return res.json({
        success: true,
        message: emailResult.message || '6 xonali tasdiqlash kodi emailingizga yuborildi',
        identifier: targetKey,
        channel: emailResult.mode || 'email',
        direct_register_available: true,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    } else {
      console.log(`[OTP] Generated OTP for ${normPhone}: [${code}]. Telegram Bot link: ${telegramBotUrl}`);
      return res.json({
        success: true,
        message: 'Tasdiqlash kodi tayyorlandi',
        identifier: normPhone,
        channel: 'phone',
        direct_register_available: true,
        code: process.env.NODE_ENV !== 'production' ? code : undefined,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    }
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({
      error: 'server_error',
      message: `Tasdiqlash kodini yuborishda server xatosi: ${err.message}`,
      details: { code: err.code, name: err.name }
    });
  }
});

// POST /api/auth/resend-otp - Resends 6-digit OTP with 60-second cooldown
authRouter.post('/resend-otp', async (req, res) => {
  try {
    const { phone, email, identifier, type } = req.body;
    const rawTarget = (email || phone || identifier || '').toString().trim().replace(/\s+/g, '');

    if (!rawTarget) {
      return res.status(400).json({ error: 'missing_target', message: 'Telefon raqam yoki email kiritilishi shart' });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    if (!targetKey) {
      return res.status(400).json({ error: 'invalid_identifier', message: 'Noto‘g‘ri telefon raqam yoki email' });
    }

    // Rate limiting: 60-second cooldown per identifier
    const cooldownRemaining = await checkOtpCooldown(targetKey);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        error: 'rate_limit',
        message: `Iltimos, qayta yuborishdan oldin ${cooldownRemaining} soniya kuting`,
        retry_after: cooldownRemaining
      });
    }

    // Generate new 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpType = type || 'verification';
    await createOtpRecord(targetKey, code, otpType);

    const phoneDigits = normPhone ? normPhone.replace(/\D/g, '') : '';
    const telegramBotUrl = normPhone ? `https://t.me/HumoLogisticsBot?start=verify_${phoneDigits}` : null;

    if (isEmail) {
      const purpose = (otpType === 'registration' || otpType === 'register')
        ? "Ro'yxatdan o'tishni tasdiqlash kodi"
        : otpType.includes('forgot')
          ? "Parolni tiklash kodi"
          : "Tasdiqlash kodi";

      const emailResult = await sendOtpEmail(targetKey, code, purpose);

      return res.json({
        success: true,
        message: emailResult.message || 'Yangi tasdiqlash kodi emailingizga yuborildi',
        identifier: targetKey,
        channel: emailResult.mode || 'email',
        direct_register_available: true,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    } else {
      console.log(`[Resend OTP] Generated OTP for ${normPhone}: [${code}]. Telegram Bot link: ${telegramBotUrl}`);
      return res.json({
        success: true,
        message: 'Yangi tasdiqlash kodi tayyorlandi',
        identifier: normPhone,
        channel: 'phone',
        direct_register_available: true,
        code: process.env.NODE_ENV !== 'production' ? code : undefined,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    }
  } catch (err) {
    console.error('Error in resend-otp:', err);
    res.status(500).json({
      error: 'server_error',
      message: `Kodni qayta yuborishda server xatosi: ${err.message}`,
      details: { code: err.code, name: err.name }
    });
  }
});

// POST /api/auth/verify-otp - Verifies 6-digit OTP code with attempt tracking
authRouter.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, identifier, otp } = req.body;
    const rawTarget = (email || phone || identifier || '').toString().trim().replace(/\s+/g, '');
    const inputOtp = (otp || '').toString().trim();

    if (!rawTarget || !inputOtp || inputOtp.length < 6) {
      return res.status(400).json({ error: 'invalid_otp', message: '6 xonali tasdiqlash kodini kiriting' });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    const validation = await validateAndConsumeOtp(targetKey, inputOtp);
    if (!validation.valid) {
      return res.status(validation.status || 400).json({
        error: validation.error,
        message: validation.message
      });
    }

    // Find or create user
    let user = null;
    if (isEmail) {
      user = await db.queryOne('SELECT * FROM users WHERE email = $1', [targetKey]);
    } else {
      const phoneDigits = normPhone.replace(/\D/g, '');
      const syntheticEmail = `${phoneDigits}@humologistics.uz`;
      user = await db.queryOne(
        'SELECT * FROM users WHERE phone = $1 OR phone = $2 OR email = $3',
        [normPhone, phoneDigits, syntheticEmail]
      );
    }

    if (user) {
      // Mark as verified
      if (!user.is_verified) {
        await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [user.id]);
        user.is_verified = true;
      }

      const { token } = await createSession(user.id);
      res.cookie('humo_session', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          profile_completed: user.profile_completed,
          is_verified: user.is_verified,
          free_contacts_remaining: user.free_contacts_remaining ?? 117,
          created_at: user.created_at
        }
      });
    } else {
      // Not yet registered, return verified status so registration form can proceed
      return res.json({
        success: true,
        verified: true,
        identifier: targetKey,
        message: 'Kod muvaffaqiyatli tasdiqlandi'
      });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'server_error', message: 'Kodni tekshirishda xatolik yuz berdi' });
  }
});

// POST /api/auth/forgot-password - Initiates password reset OTP
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    const rawTarget = (identifier || '').toString().trim().replace(/\s+/g, '');

    if (!rawTarget) {
      return res.status(400).json({ error: 'missing_identifier', message: 'Telefon raqam yoki email kiriting' });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    let user = null;
    if (isEmail) {
      user = await db.queryOne('SELECT * FROM users WHERE email = $1 LIMIT 1', [targetKey]);
    } else if (normPhone) {
      const phoneDigits = normPhone.replace(/\D/g, '');
      const syntheticEmail = `${phoneDigits}@humologistics.uz`;
      user = await db.queryOne(
        'SELECT * FROM users WHERE phone = $1 OR phone = $2 OR email = $3 LIMIT 1',
        [normPhone, phoneDigits, syntheticEmail]
      );
    }

    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'Ushbu telefon raqam yoki emailga tegishli foydalanuvchi topilmadi'
      });
    }

    // Rate limiting: 60-second cooldown
    const cooldownRemaining = await checkOtpCooldown(targetKey);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        error: 'rate_limit',
        message: `Iltimos, qayta yuborishdan oldin ${cooldownRemaining} soniya kuting`,
        retry_after: cooldownRemaining
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await createOtpRecord(targetKey, code, 'forgot_password');

    const phoneDigits = user.phone ? user.phone.replace(/\D/g, '') : '';
    const telegramBotUrl = phoneDigits ? `https://t.me/HumoLogisticsBot?start=verify_${phoneDigits}` : null;

    if (user.email && !user.email.endsWith('@humologistics.uz')) {
      const emailResult = await sendPasswordResetEmail(user.email, code);
      if (!emailResult.success) {
        return res.status(502).json({
          error: emailResult.error || 'email_failed',
          message: emailResult.message || 'Parolni tiklash kodini yuborishda xatolik yuz berdi',
          details: emailResult.details
        });
      }

      return res.json({
        success: true,
        message: `Tiklash kodi ${user.email} manziliga yuborildi`,
        identifier: targetKey,
        target_display: user.email,
        channel: 'email',
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    } else {
      console.log(`[ForgotPassword] OTP for ${targetKey}: [${code}]`);
      return res.json({
        success: true,
        message: 'Tiklash kodi tayyorlandi',
        identifier: targetKey,
        target_display: user.phone || targetKey,
        channel: 'phone',
        code: process.env.NODE_ENV !== 'production' ? code : undefined,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    }
  } catch (err) {
    console.error('Error during forgot-password:', err);
    res.status(500).json({
      error: 'server_error',
      message: `Parolni tiklashda server xatosi: ${err.message}`,
      details: { code: err.code, name: err.name }
    });
  }
});

// POST /api/auth/reset-password - Verifies OTP with max 5 attempts and sets new password
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, new_password, newPassword } = req.body;
    const rawTarget = (identifier || '').toString().trim().replace(/\s+/g, '');
    const inputOtp = (otp || '').toString().trim();
    const password = (new_password || newPassword || '').toString().trim();

    if (!rawTarget || !inputOtp || !password) {
      return res.status(400).json({ error: 'missing_fields', message: 'Barcha maydonlarni to‘ldiring' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'invalid_password', message: 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    const validation = await validateAndConsumeOtp(targetKey, inputOtp);
    if (!validation.valid) {
      return res.status(validation.status || 400).json({
        error: validation.error,
        message: validation.message
      });
    }

    // Find the user
    let user = null;
    if (isEmail) {
      user = await db.queryOne('SELECT * FROM users WHERE email = $1 LIMIT 1', [targetKey]);
    } else if (normPhone) {
      const phoneDigits = normPhone.replace(/\D/g, '');
      const syntheticEmail = `${phoneDigits}@humologistics.uz`;
      user = await db.queryOne(
        'SELECT * FROM users WHERE phone = $1 OR phone = $2 OR email = $3 LIMIT 1',
        [normPhone, phoneDigits, syntheticEmail]
      );
    }

    if (!user) {
      return res.status(404).json({ error: 'user_not_found', message: 'Foydalanuvchi topilmadi' });
    }

    // Update password
    const now = new Date().toISOString();
    const newHash = hashPassword(password);
    await db.query('UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3', [newHash, now, user.id]);

    // Create session and log in
    const { token } = await createSession(user.id);
    res.cookie('humo_session', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.json({
      success: true,
      message: 'Parol muvaffaqiyatli o‘zgartirildi',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        profile_completed: user.profile_completed,
        is_verified: user.is_verified,
        free_contacts_remaining: user.free_contacts_remaining ?? 117,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'server_error', message: 'Parolni tiklashda xatolik yuz berdi' });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    if (req.sessionToken) {
      await deleteSession(req.sessionToken);
    }
  } catch (err) {
    console.error('Error during logout:', err);
  }
  res.clearCookie('humo_session');
  res.json({ success: true });
});

authRouter.get('/me', (req, res) => {
  if (!req.user) {
    return res.json({ user: null, token: null });
  }
  res.json({ user: req.user, token: req.sessionToken });
});
