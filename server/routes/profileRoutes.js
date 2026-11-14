import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

export const profileRouter = Router();

// Validate international phone number: must start with +, between 8 and 15 digits
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  return phoneRegex.test(cleaned);
}

export function cleanPhone(phone) {
  return phone.replace(/[\s\-\(\)]/g, '');
}

profileRouter.get('/', requireAuth, async (req, res) => {
  try {
    const user = await db.queryOne(`
      SELECT id, email, first_name, last_name, phone, role, profile_completed, is_verified, created_at, updated_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'not_found', message: 'User not found' });
    }

    res.json({ profile: user });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch profile' });
  }
});

profileRouter.put('/', requireAuth, async (req, res) => {
  try {
    const { first_name, last_name, phone, role } = req.body;

    const errors = {};

    if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    }

    if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
      errors.last_name = 'Last name must be at least 2 characters';
    }

    const validRoles = ['driver', 'dispatcher', 'cargo_owner', 'user'];
    if (!role || !validRoles.includes(role)) {
      errors.role = 'Role must be Driver, Dispatcher, or Cargo Owner';
    }

    if (!phone || !validatePhone(phone)) {
      errors.phone = 'Valid phone number with country code is required (e.g. +998901234567)';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'validation_failed', errors });
    }

    const cleanedPhone = cleanPhone(phone);
    const now = new Date().toISOString();

    // Business roles never grant admin rights; profile_completed becomes 1
    await db.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, role = $4, profile_completed = 1, updated_at = $5
      WHERE id = $6
    `, [first_name.trim(), last_name.trim(), cleanedPhone, role, now, req.user.id]);

    const updatedUser = await db.queryOne(`
      SELECT id, email, first_name, last_name, phone, role, profile_completed, is_verified, created_at, updated_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    res.json({
      message: 'Profile updated successfully',
      profile: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update profile' });
  }
});
