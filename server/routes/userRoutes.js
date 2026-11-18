import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, createSession } from '../auth.js';

export const userRouter = Router();

const ALLOWED_ROLES = ['driver', 'shipper', 'dispatcher'];

/**
 * GET /api/users/me
 * Returns current authenticated user with active_role & available_roles
 */
userRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.queryOne(`
      SELECT id, email, first_name, last_name, phone, role,
             COALESCE(active_role, 'driver') as active_role,
             available_roles,
             profile_completed, is_verified, is_banned,
             COALESCE(free_contacts_remaining, 117) as free_contacts_remaining,
             plan_id, plan_expires_at, created_at, updated_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({ success: false, error: 'user_not_found', message: 'Foydalanuvchi topilmadi' });
    }

    let availableRoles = user.available_roles;
    if (typeof availableRoles === 'string') {
      try { availableRoles = JSON.parse(availableRoles); } catch { availableRoles = ALLOWED_ROLES; }
    } else if (!Array.isArray(availableRoles)) {
      availableRoles = ALLOWED_ROLES;
    }

    return res.json({
      success: true,
      user: {
        ...user,
        available_roles: availableRoles
      }
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    return res.status(500).json({ success: false, error: 'server_error', message: 'Foydalanuvchi ma‘lumotlarini olishda xatolik' });
  }
});

/**
 * PATCH /api/users/active-role
 * Switches the active operational role of the authenticated user
 */
userRouter.patch('/active-role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || typeof role !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'missing_role',
        message: "Rol kiritilishi shart (role majburiy)"
      });
    }

    const cleanRole = role.trim().toLowerCase();
    if (!ALLOWED_ROLES.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_role',
        message: `Noto'g'ri rol kiritildi. Ruxsat etilgan rollar: ${ALLOWED_ROLES.join(', ')}`
      });
    }

    const now = new Date().toISOString();
    await db.query(
      'UPDATE users SET active_role = $1, updated_at = $2 WHERE id = $3',
      [cleanRole, now, req.user.id]
    );

    // Refresh user from DB
    const updatedUser = await db.queryOne(`
      SELECT id, email, first_name, last_name, phone, role,
             COALESCE(active_role, 'driver') as active_role,
             available_roles,
             profile_completed, is_verified, is_banned,
             COALESCE(free_contacts_remaining, 117) as free_contacts_remaining,
             plan_id, plan_expires_at, created_at, updated_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    let availableRoles = updatedUser.available_roles;
    if (typeof availableRoles === 'string') {
      try { availableRoles = JSON.parse(availableRoles); } catch { availableRoles = ALLOWED_ROLES; }
    } else if (!Array.isArray(availableRoles)) {
      availableRoles = ALLOWED_ROLES;
    }

    // Reuse or refresh session token
    let token = req.sessionToken;
    if (!token) {
      const session = await createSession(req.user.id);
      token = session.token;
    }

    return res.json({
      success: true,
      message: "Faol rol muvaffaqiyatli yangilandi",
      active_role: cleanRole,
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        active_role: cleanRole,
        available_roles: availableRoles,
        profile_completed: updatedUser.profile_completed,
        is_verified: updatedUser.is_verified,
        free_contacts_remaining: updatedUser.free_contacts_remaining,
        plan_id: updatedUser.plan_id,
        plan_expires_at: updatedUser.plan_expires_at,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (err) {
    console.error('Error switching active role:', err);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: "Rolni yangilashda xatolik yuz berdi"
    });
  }
});
