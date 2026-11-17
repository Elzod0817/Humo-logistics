import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { hashPassword, verifyPassword, createSession, deleteSession } from '../auth.js';
import { sendOtpEmail, sendRegistrationOtpEmail, sendPasswordResetEmail, getEmailStatus } from '../services/emailService.js';

export const authRouter = Router();

const OTP_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

// In-memory pending registrations awaiting 6-digit OTP verification
// Key: lowercase email
// Value: { name, phone, email, password, role, code, expiresAt, attempts, createdAt }
export const pendingRegistrations = new Map();

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

authRouter.get('/debug-email', (req, res) => {
  const rawKey = (process.env.BREVO_API_KEY || '').trim();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const sender = (process.env.SENDER_EMAIL || process.env.GMAIL_USER || '').trim();
  res.json({
    hasKey: Boolean(rawKey),
    keyPrefix: rawKey ? rawKey.slice(0, 8) : null,
    keyLength: rawKey.length,
    isKeyFormatValid: rawKey.startsWith('xkeysib-'),
    isSmtpKey: rawKey.startsWith('xsmtpsib-'),
    hasResendKey: Boolean(resendKey),
    resendPrefix: resendKey ? resendKey.slice(0, 5) : null,
    sender: sender || null
  });
});

authRouter.post('/register', async (req, res) => {
  try {
    const { email, phone, password, name, first_name, last_name, role } = req.body;

    const rawName = (name || first_name || '').toString().trim();
    if (!rawName) {
      return res.status(400).json({ success: false, message: 'Ism va familiyangizni kiriting' });
    }

    const rawPhone = (phone || '').toString().trim().replace(/\s+/g, '');
    const normalizedPhone = normalizePhone(rawPhone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: "Telefon raqamingizni to'g'ri kiriting (+998...)" });
    }

    const rawEmail = (email || '').toString().trim().toLowerCase();
    if (!rawEmail || !rawEmail.includes('@')) {
      return res.status(400).json({ success: false, message: "Email manzilingizni to'liq kiriting (masalan: ism@gmail.com)" });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    const barePhone = normalizedPhone.replace(/^\+/, '');
    // Check if email or phone is already verified in DB
    const existingVerified = await db.queryOne(
      'SELECT id, email, phone, is_verified FROM users WHERE (email = $1 OR phone = $2 OR phone = $3) AND is_verified = TRUE LIMIT 1',
      [rawEmail, normalizedPhone, barePhone]
    );

    if (existingVerified) {
      return res.status(400).json({
        success: false,
        message: "Bu email yoki telefon raqam allaqachon ro'yxatdan o'tgan"
      });
    }

    // Rate limiting: 60-second cooldown on this email
    const cooldownRemaining = await checkOtpCooldown(rawEmail);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        error: 'rate_limit',
        message: `Iltimos, qayta yuborishdan oldin ${cooldownRemaining} soniya kuting`,
        retry_after: cooldownRemaining
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending registration payload in memory Map
    pendingRegistrations.set(rawEmail, {
      name: rawName,
      first_name: rawName,
      last_name: (last_name || '').toString().trim() || null,
      phone: normalizedPhone,
      email: rawEmail,
      password: password,
      role: (role && ['carrier', 'shipper', 'dispatcher', 'admin', 'user'].includes(role)) ? role : 'carrier',
      code,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
      createdAt: Date.now()
    });

    // Also store OTP record in DB
    await createOtpRecord(rawEmail, code, 'registration');

    // Send 6-digit OTP via Brevo
    try {
      await sendOtpEmail(rawEmail, code, "Ro'yxatdan o'tishni tasdiqlash kodi");
    } catch (sendErr) {
      console.error('[Register] Email delivery failed:', sendErr);
      pendingRegistrations.delete(rawEmail);
      return res.status(500).json({
        success: false,
        message: 'Email yuborishda xatolik: ' + (sendErr.message || 'Xatolik yuz berdi')
      });
    }

    // Mandatory OTP Step: ONLY send OTP and return requiresOtp: true — NEVER return a token!
    return res.status(200).json({
      success: true,
      requiresOtp: true,
      email: rawEmail,
      identifier: rawEmail,
      message: '6 xonali tasdiqlash kodi emailingizga yuborildi',
      cooldown: OTP_COOLDOWN_SECONDS,
      expires_in: OTP_EXPIRY_MINUTES * 60
    });
  } catch (err) {
    console.error('Error during registration OTP dispatch:', err);
    return res.status(500).json({
      success: false,
      message: 'Ro‘yxatdan o‘tishda xatolik yuz berdi: ' + (err.message || '')
    });
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

// Helper to validate and consume OTP with 5 max attempts (Strict verification - NO master codes or bypasses)
async function validateAndConsumeOtp(identifier, inputOtp) {
  const codeStr = (inputOtp || '').toString().trim();

  if (!codeStr || codeStr.length < 6) {
    return {
      valid: false,
      status: 400,
      error: 'invalid_code',
      message: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
    };
  }

  const now = new Date().toISOString();
  const record = await db.queryOne(
    'SELECT * FROM otp_codes WHERE identifier = $1 AND expires_at > $2 ORDER BY created_at DESC LIMIT 1',
    [identifier, now]
  );

  if (!record) {
    return {
      valid: false,
      status: 400,
      error: 'invalid_code',
      message: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
    };
  }

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

  if (record.code !== codeStr) {
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
        message: `Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring. (Qolgan urinishlar: ${remaining})`
      };
    }
  }

  // Code matched strictly! Clean up used OTP
  await db.query('DELETE FROM otp_codes WHERE id = $1', [record.id]);
  return { valid: true };
}

// Helper to validate OTP WITHOUT deleting it (used for 2-step verification, e.g. verify-reset-otp)
async function validateOtpReadOnly(identifier, inputOtp) {
  const codeStr = (inputOtp || '').toString().trim();

  if (!codeStr || codeStr.length < 6) {
    return {
      valid: false,
      status: 400,
      error: 'invalid_code',
      message: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
    };
  }

  const now = new Date().toISOString();
  const record = await db.queryOne(
    'SELECT * FROM otp_codes WHERE identifier = $1 AND expires_at > $2 ORDER BY created_at DESC LIMIT 1',
    [identifier, now]
  );

  if (!record) {
    return {
      valid: false,
      status: 400,
      error: 'invalid_code',
      message: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
    };
  }

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

  if (record.code !== codeStr) {
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
        message: `Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring. (Qolgan urinishlar: ${remaining})`
      };
    }
  }

  // Code matched strictly! Do NOT delete so /reset-password can consume it in Step 2.
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
        code: process.env.NODE_ENV !== 'production' ? code : undefined,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    }
  } catch (err) {
    console.error('Error sending OTP:', err);
    const statusCode = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    res.status(statusCode).json({
      success: false,
      error: err.brevoCode || err.code || 'email_delivery_failed',
      message: err.message || 'Tasdiqlash kodini yuborishda server xatosi',
      details: { code: err.brevoCode || err.code, name: err.name }
    });
  }
});

// POST /api/auth/resend-otp - Resends 6-digit OTP with 60-second cooldown
authRouter.post('/resend-otp', async (req, res) => {
  try {
    const { phone, email, identifier, type } = req.body;
    const rawTarget = (email || phone || identifier || '').toString().trim().replace(/\s+/g, '');

    if (!rawTarget) {
      return res.status(400).json({ success: false, message: 'Telefon raqam yoki email kiritilishi shart' });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    if (!targetKey) {
      return res.status(400).json({ success: false, message: 'Noto‘g‘ri telefon raqam yoki email' });
    }

    // Rate limiting: 60-second cooldown per identifier
    const cooldownRemaining = await checkOtpCooldown(targetKey);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        error: 'rate_limit',
        message: `Iltimos, qayta yuborishdan oldin ${cooldownRemaining} soniya kuting`,
        retry_after: cooldownRemaining
      });
    }

    // Generate new 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpType = type || 'registration';
    await createOtpRecord(targetKey, code, otpType);

    // Update pending registration in memory if exists
    if (isEmail && pendingRegistrations.has(targetKey)) {
      const p = pendingRegistrations.get(targetKey);
      p.code = code;
      p.expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
      p.attempts = 0;
    }

    const phoneDigits = normPhone ? normPhone.replace(/\D/g, '') : '';
    const telegramBotUrl = normPhone ? `https://t.me/HumoLogisticsBot?start=verify_${phoneDigits}` : null;

    if (isEmail) {
      const purpose = (otpType === 'registration' || otpType === 'register')
        ? "Ro'yxatdan o'tishni tasdiqlash kodi"
        : otpType.includes('forgot')
          ? "Parolni tiklash kodi"
          : "Tasdiqlash kodi";

      try {
        await sendOtpEmail(targetKey, code, purpose);
      } catch (sendErr) {
        console.error('[Resend OTP] Email delivery failed:', sendErr);
        return res.status(500).json({
          success: false,
          message: 'Email yuborishda xatolik: ' + (sendErr.message || 'Xatolik yuz berdi')
        });
      }

      return res.json({
        success: true,
        message: 'Yangi tasdiqlash kodi emailingizga yuborildi',
        identifier: targetKey,
        channel: 'email',
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
        code: process.env.NODE_ENV !== 'production' ? code : undefined,
        telegram_bot_url: telegramBotUrl,
        cooldown: OTP_COOLDOWN_SECONDS,
        expires_in: OTP_EXPIRY_MINUTES * 60
      });
    }
  } catch (err) {
    console.error('Error in resend-otp:', err);
    res.status(500).json({
      success: false,
      message: 'Kodni qayta yuborishda server xatosi'
    });
  }
});

// POST /api/auth/verify-otp - Strict verification of 6-digit OTP code & genuine user activation
authRouter.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, identifier, otp, code, password, name, first_name, last_name, role } = req.body;
    const rawTarget = (email || phone || identifier || '').toString().trim().replace(/\s+/g, '');
    const inputOtp = (code || otp || '').toString().trim();

    if (!rawTarget || !inputOtp || inputOtp.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'invalid_otp',
        message: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
      });
    }

    const isEmail = rawTarget.includes('@');
    const normEmail = isEmail ? rawTarget.toLowerCase() : null;
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = normEmail || normPhone;

    if (!targetKey) {
      return res.status(400).json({
        success: false,
        error: 'invalid_identifier',
        message: 'Noto‘g‘ri telefon raqam yoki email'
      });
    }

    // Check in-memory pending registrations first
    let pending = normEmail ? pendingRegistrations.get(normEmail) : null;
    if (!pending && normPhone) {
      for (const p of pendingRegistrations.values()) {
        if (p.phone === normPhone) {
          pending = p;
          break;
        }
      }
    }

    let isValid = false;

    if (pending) {
      if (Date.now() > pending.expiresAt) {
        pendingRegistrations.delete(pending.email);
        return res.status(400).json({
          success: false,
          error: 'expired_code',
          message: "Tasdiqlash kodining muddati o'tgan. Iltimos, yangi kod so'rang"
        });
      }

      if (pending.attempts >= MAX_OTP_ATTEMPTS) {
        pendingRegistrations.delete(pending.email);
        return res.status(400).json({
          success: false,
          error: 'max_attempts_exceeded',
          message: "Urinishlar soni tugadi (5 ta xato urinish). Yangi kod so‘rang"
        });
      }

      if (pending.code === inputOtp) {
        isValid = true;
      } else {
        pending.attempts = (pending.attempts || 0) + 1;
        const remaining = MAX_OTP_ATTEMPTS - pending.attempts;
        if (remaining <= 0) {
          pendingRegistrations.delete(pending.email);
          return res.status(400).json({
            success: false,
            error: 'max_attempts_exceeded',
            message: "Urinishlar soni tugadi (5 ta xato urinish). Yangi kod so‘rang"
          });
        }
        return res.status(400).json({
          success: false,
          error: 'invalid_code',
          message: `Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring. (Qolgan urinishlar: ${remaining})`
        });
      }
    }

    // If not validated via pending in-memory, validate with DB
    if (!isValid) {
      const dbValidation = await validateAndConsumeOtp(targetKey, inputOtp);
      if (dbValidation.valid) {
        isValid = true;
      } else {
        return res.status(400).json({
          success: false,
          error: dbValidation.error || 'invalid_code',
          message: dbValidation.message || "Noto'g'ri yoki muddati o'tgan tasdiqlash kodi"
        });
      }
    }

    // Delete DB otp_codes record if still present
    await db.query('DELETE FROM otp_codes WHERE identifier = $1', [targetKey]);

    const targetEmail = pending?.email || normEmail || (email && email.includes('@') ? email.trim().toLowerCase() : null);
    const targetPhone = pending?.phone || normPhone || (phone ? normalizePhone(phone) : null);
    const targetName = (pending?.name || name || first_name || '').trim();
    const targetLastName = (pending?.last_name || last_name || '').trim();
    const targetPassword = pending?.password || password;
    const targetRole = pending?.role || role || 'carrier';

    // Find existing user in DB
    let user = null;
    if (targetEmail) {
      user = await db.queryOne('SELECT * FROM users WHERE email = $1 LIMIT 1', [targetEmail]);
    }
    if (!user && targetPhone) {
      const barePhone = targetPhone.replace(/^\+/, '');
      user = await db.queryOne('SELECT * FROM users WHERE phone = $1 OR phone = $2 LIMIT 1', [targetPhone, barePhone]);
    }

    const now = new Date().toISOString();

    if (!user) {
      // Create user genuinely in DB so they are registered and saved
      const newId = crypto.randomUUID();
      const userPassword = targetPassword || `Humo_${crypto.randomBytes(6).toString('hex')}`;
      const passwordHash = hashPassword(userPassword);
      const userFirstName = targetName || (targetEmail ? targetEmail.split('@')[0] : 'Foydalanuvchi');
      const userLastName = targetLastName || null;
      const userRole = ['carrier', 'shipper', 'dispatcher', 'admin', 'user'].includes(targetRole) ? targetRole : 'carrier';
      const finalEmail = targetEmail || (targetPhone ? `${targetPhone.replace(/\D/g, '')}@humologistics.uz` : `${newId.slice(0, 8)}@humologistics.uz`);

      await db.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, phone, role,
          profile_completed, is_verified, is_banned, free_contacts_remaining,
          plan_id, plan_expires_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          1, TRUE, FALSE, 117,
          NULL, NULL, $8, $9
        )
      `, [newId, finalEmail, passwordHash, userFirstName, userLastName, targetPhone, userRole, now, now]);

      user = await db.queryOne('SELECT * FROM users WHERE id = $1', [newId]);
    } else {
      // User exists - activate and mark as verified, update password if provided
      if (targetPassword) {
        const passwordHash = hashPassword(targetPassword);
        await db.query('UPDATE users SET is_verified = TRUE, password_hash = $1, updated_at = $2 WHERE id = $3', [passwordHash, now, user.id]);
      } else {
        await db.query('UPDATE users SET is_verified = TRUE, updated_at = $1 WHERE id = $2', [now, user.id]);
      }
      user = await db.queryOne('SELECT * FROM users WHERE id = $1', [user.id]);
    }

    // Clean up memory
    if (pending) {
      pendingRegistrations.delete(pending.email);
    }

    // Generate real JWT token
    const { token } = await createSession(user.id);
    res.cookie('humo_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

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
        is_verified: true,
        free_contacts_remaining: user.free_contacts_remaining ?? 117,
        plan_id: user.plan_id || null,
        plan_expires_at: user.plan_expires_at || null,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Kodni tekshirishda xatolik yuz berdi'
    });
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

// POST /api/auth/verify-reset-otp - Step 1 of Password Reset: verifies OTP without deleting it
authRouter.post('/verify-reset-otp', async (req, res) => {
  try {
    const { identifier, otp, code } = req.body;
    const rawTarget = (identifier || '').toString().trim().replace(/\s+/g, '');
    const inputOtp = (code || otp || '').toString().trim();

    if (!rawTarget || !inputOtp || inputOtp.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'invalid_code',
        message: "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
      });
    }

    const isEmail = rawTarget.includes('@');
    const normPhone = !isEmail ? normalizePhone(rawTarget) : null;
    const targetKey = isEmail ? rawTarget.toLowerCase() : normPhone;

    if (!targetKey) {
      return res.status(400).json({
        success: false,
        error: 'invalid_identifier',
        message: 'Noto‘g‘ri telefon raqam yoki email'
      });
    }

    const validation = await validateOtpReadOnly(targetKey, inputOtp);
    if (!validation.valid) {
      return res.status(validation.status || 400).json({
        success: false,
        error: validation.error,
        message: validation.message || "Noto'g'ri tasdiqlash kodi kiritildi. Qaytadan tekshiring."
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: "Tasdiqlash kodi to'g'ri. Endi yangi parolingizni kiriting."
    });
  } catch (err) {
    console.error('Error during verify-reset-otp:', err);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Kodni tekshirishda xatolik yuz berdi'
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
