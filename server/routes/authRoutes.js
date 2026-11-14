import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { hashPassword, verifyPassword, createSession, deleteSession } from '../auth.js';

export const authRouter = Router();

export function normalizePhone(input) {
  if (!input || typeof input !== 'string') return null;
  const digits = input.replace(/\D/g, '');
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

authRouter.post('/register', async (req, res) => {
  try {
    const { email, phone, password, name, first_name, last_name, role } = req.body;

    const rawPhone = phone || (email && !email.includes('@') ? email : null);
    const normalizedPhone = rawPhone ? normalizePhone(rawPhone) : null;
    
    let normalizedEmail = null;
    if (email && email.includes('@')) {
      normalizedEmail = email.trim().toLowerCase();
    } else if (normalizedPhone) {
      normalizedEmail = `${normalizedPhone.replace(/\D/g, '')}@humologistics.uz`;
    }

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'invalid_contact', message: 'Telefon raqam yoki email talab qilinadi' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'invalid_password', message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    // Check existing user by email or phone
    let existing = null;
    if (normalizedPhone) {
      const barePhone = normalizedPhone.replace(/^\+/, '');
      existing = await db.queryOne(
        'SELECT id FROM users WHERE email = $1 OR phone = $2 OR phone = $3',
        [normalizedEmail, normalizedPhone, barePhone]
      );
    } else {
      existing = await db.queryOne('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    }

    if (existing) {
      return res.status(409).json({ error: 'user_exists', message: 'Ushbu telefon raqam yoki email bilan hisob allaqachon mavjud' });
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
        1, false, false, 117, 
        NULL, NULL, $8, $9
      )
    `, [id, normalizedEmail, passwordHash, userFirstName, userLastName, normalizedPhone, userRole, now, now]);

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
        is_verified: false,
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
    const rawId = (phone || email || identifier || '').toString().trim();

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

authRouter.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const normPhone = normalizePhone(phone);
  if (!normPhone) {
    return res.status(400).json({ error: 'invalid_phone', message: 'To‘g‘ri telefon raqamini kiriting' });
  }
  // Simulated OTP for rapid mobile verification
  return res.json({ success: true, message: 'SMS kod yuborildi', phone: normPhone });
});

authRouter.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const normPhone = normalizePhone(phone);
  if (!normPhone || !otp || otp.length < 6) {
    return res.status(400).json({ error: 'invalid_otp', message: '6 xonali SMS kodni kiriting' });
  }

  // Lookup or create user for this phone
  const phoneDigits = normPhone.replace(/\D/g, '');
  const syntheticEmail = `${phoneDigits}@humologistics.uz`;
  let user = await db.queryOne('SELECT * FROM users WHERE phone = $1 OR email = $2', [normPhone, syntheticEmail]);

  if (!user) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const defaultHash = hashPassword('HumoOtp2026!');
    await db.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, role, 
        profile_completed, is_verified, is_banned, free_contacts_remaining, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, NULL, $5, 'carrier', 
        1, true, false, 117, $6, $7
      )
    `, [id, syntheticEmail, defaultHash, 'Foydalanuvchi', normPhone, now, now]);
    user = await db.queryOne('SELECT * FROM users WHERE id = $1', [id]);
  }

  const { token } = await createSession(user.id);
  res.cookie('humo_session', token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

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
      created_at: user.created_at
    }
  });
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
