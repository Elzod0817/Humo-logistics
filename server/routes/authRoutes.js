import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { hashPassword, verifyPassword, createSession, deleteSession } from '../auth.js';

export const authRouter = Router();

authRouter.get('/google-status', (req, res) => {
  res.json({
    available: false,
    reason: 'Google authentication requires cloud-configured OAuth 2.0 credentials and domain redirect endpoints, which are unavailable on this local environment.',
    limitation_reported: true
  });
});

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'invalid_email', message: 'Valid email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'invalid_password', message: 'Password must be at least 6 characters' });
    }

    // Check existing
    const existing = await db.queryOne('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ error: 'email_exists', message: 'An account with this email already exists' });
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, role, 
        profile_completed, is_verified, is_banned, free_contacts_remaining, 
        plan_id, plan_expires_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, NULL, NULL, NULL, 'user', 
        0, false, false, 117, 
        NULL, NULL, $4, $5
      )
    `, [id, normalizedEmail, passwordHash, now, now]);

    const { token, expiresAt } = await createSession(id);

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
        first_name: null,
        last_name: null,
        phone: null,
        role: 'user',
        profile_completed: 0,
        is_verified: false,
        free_contacts_remaining: 117,
        plan_id: null,
        plan_expires_at: null,
        created_at: now
      }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'server_error', message: 'Registration failed' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'missing_credentials', message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.queryOne('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'account_banned', message: 'Your account has been suspended' });
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
    res.status(500).json({ error: 'server_error', message: 'Login failed' });
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
