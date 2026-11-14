import crypto from 'node:crypto';
import { db } from './db.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await db.query(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)',
    [token, userId, createdAt, expiresAt]
  );

  return { token, expiresAt };
}

export async function deleteSession(token) {
  if (!token) return;
  await db.query('DELETE FROM sessions WHERE token = $1', [token]);
}

export async function getSessionUser(token) {
  if (!token) return null;
  const now = new Date().toISOString();

  const query = `
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, 
           u.profile_completed, u.is_verified, u.is_banned,
           COALESCE(u.free_contacts_remaining, 117) as free_contacts_remaining,
           u.plan_id, u.plan_expires_at,
           u.created_at, u.updated_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = $1 AND s.expires_at > $2
  `;
  const user = await db.queryOne(query, [token, now]);
  if (user && user.is_banned) {
    return null;
  }
  return user || null;
}

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.humo_session) {
      token = req.cookies.humo_session;
    }

    if (token) {
      const user = await getSessionUser(token);
      if (user) {
        req.user = user;
        req.sessionToken = token;
      }
    }
  } catch (err) {
    console.error('Error in auth middleware:', err);
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Sign in required to perform this action'
    });
  }
  if (req.user.is_banned) {
    return res.status(403).json({
      error: 'account_banned',
      message: 'Your account has been suspended by an administrator'
    });
  }
  next();
}

export function requireProfileComplete(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Sign in required'
    });
  }
  if (req.user.is_banned) {
    return res.status(403).json({
      error: 'account_banned',
      message: 'Your account has been suspended by an administrator'
    });
  }
  if (!req.user.profile_completed) {
    return res.status(403).json({
      error: 'profile_incomplete',
      message: 'Please complete your profile before continuing'
    });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authentication required'
    });
  }
  if (req.user.is_banned) {
    return res.status(403).json({
      error: 'account_banned',
      message: 'Your account has been suspended by an administrator'
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Administrator privileges required'
    });
  }
  next();
}
