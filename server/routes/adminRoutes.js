import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

export const adminRouter = Router();

// Enforce admin privileges for all admin routes
adminRouter.use(requireAdmin);

// GET /api/admin/stats - KPI Metrics & System Totals
adminRouter.get('/stats', async (req, res) => {
  try {
    const totalUsers = await db.queryOne('SELECT COUNT(*) as count FROM users');
    const verifiedUsers = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE');
    const bannedUsers = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE is_banned = TRUE');
    const activeCargo = await db.queryOne("SELECT COUNT(*) as count FROM listings WHERE status = 'active'");
    const totalCargo = await db.queryOne('SELECT COUNT(*) as count FROM listings');
    const activeTransports = await db.queryOne("SELECT COUNT(*) as count FROM transports WHERE status = 'active'");
    const totalTransports = await db.queryOne('SELECT COUNT(*) as count FROM transports');
    const totalConversations = await db.queryOne('SELECT COUNT(*) as count FROM conversations');
    
    const now = new Date().toISOString();
    const activeSubscriptions = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE plan_expires_at IS NOT NULL AND plan_expires_at > $1', [now]);
    const pendingSubRequests = await db.queryOne("SELECT COUNT(*) as count FROM subscription_requests WHERE status = 'pending'");

    res.json({
      stats: {
        users: Number(totalUsers?.count || 0),
        verified_users: Number(verifiedUsers?.count || 0),
        banned_users: Number(bannedUsers?.count || 0),
        active_cargo: Number(activeCargo?.count || 0),
        total_cargo: Number(totalCargo?.count || 0),
        active_transports: Number(activeTransports?.count || 0),
        total_transports: Number(totalTransports?.count || 0),
        conversations: Number(totalConversations?.count || 0),
        active_subscriptions: Number(activeSubscriptions?.count || 0),
        pending_requests: Number(pendingSubRequests?.count || 0)
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch platform metrics' });
  }
});

// GET /api/admin/users - Users list with optional search and role filters
adminRouter.get('/users', async (req, res) => {
  try {
    const { search, role } = req.query;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, 
             u.profile_completed, u.is_verified, u.is_banned,
             COALESCE(u.free_contacts_remaining, 117) as free_contacts_remaining,
             u.plan_id, u.plan_expires_at,
             sp.name_uz as plan_name,
             u.created_at, u.updated_at
      FROM users u
      LEFT JOIN subscription_plans sp ON u.plan_id = sp.id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term);
      const idx = params.length;
      query += ` AND (LOWER(u.email) LIKE $${idx} OR LOWER(COALESCE(u.first_name, '')) LIKE $${idx} OR LOWER(COALESCE(u.last_name, '')) LIKE $${idx} OR COALESCE(u.phone, '') LIKE $${idx})`;
    }

    query += ' ORDER BY u.created_at DESC';

    const users = await db.queryAll(query, params);
    res.json({ users });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id - Verify, ban/unban, or change role of a user
adminRouter.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, is_banned, role, free_contacts_remaining, plan_id, plan_duration_days, plan_expires_at } = req.body;

    const targetUser = await db.queryOne('SELECT * FROM users WHERE id = $1', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'not_found', message: 'User not found' });
    }

    // Protection: Prevent admin from banning or demoting their own account
    if (req.user.id === id) {
      if (is_banned === true) {
        return res.status(400).json({ error: 'cannot_ban_self', message: 'You cannot ban your own administrator account' });
      }
      if (role && role !== 'admin') {
        return res.status(400).json({ error: 'cannot_demote_self', message: 'You cannot demote your own administrator privileges' });
      }
    }

    const updates = [];
    const params = [];

    if (is_verified !== undefined) {
      params.push(Boolean(is_verified));
      updates.push(`is_verified = $${params.length}`);
    }

    if (is_banned !== undefined) {
      params.push(Boolean(is_banned));
      updates.push(`is_banned = $${params.length}`);
      // If banning user, terminate all active sessions immediately
      if (is_banned === true) {
        await db.query('DELETE FROM sessions WHERE user_id = $1', [id]);
      }
    }

    if (role !== undefined) {
      const allowedRoles = ['user', 'driver', 'dispatcher', 'cargo_owner', 'admin'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'invalid_role', message: 'Invalid business role specified' });
      }
      params.push(role);
      updates.push(`role = $${params.length}`);
    }

    if (free_contacts_remaining !== undefined) {
      const cnt = parseInt(free_contacts_remaining, 10);
      params.push(isNaN(cnt) ? 117 : cnt);
      updates.push(`free_contacts_remaining = $${params.length}`);
    }

    if (plan_id !== undefined) {
      params.push(plan_id ? parseInt(plan_id, 10) : null);
      updates.push(`plan_id = $${params.length}`);
    }

    if (plan_duration_days !== undefined) {
      const days = parseInt(plan_duration_days, 10);
      const expiresAt = new Date(Date.now() + (isNaN(days) ? 30 : days) * 24 * 60 * 60 * 1000).toISOString();
      params.push(expiresAt);
      updates.push(`plan_expires_at = $${params.length}`);
    } else if (plan_expires_at !== undefined) {
      params.push(plan_expires_at);
      updates.push(`plan_expires_at = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.json({ message: 'No updates provided', user: targetUser });
    }

    const now = new Date().toISOString();
    params.push(now);
    updates.push(`updated_at = $${params.length}`);

    params.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`;
    await db.query(sql, params);

    const updatedUser = await db.queryOne(
      `SELECT id, email, first_name, last_name, phone, role, profile_completed, 
              is_verified, is_banned, free_contacts_remaining, plan_id, plan_expires_at, 
              created_at, updated_at 
       FROM users WHERE id = $1`,
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating user in admin:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update user' });
  }
});

// GET /api/admin/listings - All cargo & transport listings for moderation
adminRouter.get('/listings', async (req, res) => {
  try {
    const cargo = await db.queryAll(`
      SELECT l.*, 
             u.email as owner_email, 
             u.first_name as owner_first_name, 
             u.last_name as owner_last_name, 
             u.phone as owner_phone,
             u.is_verified as owner_verified
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);

    const transports = await db.queryAll(`
      SELECT t.*, 
             u.email as owner_email, 
             u.first_name as owner_first_name, 
             u.last_name as owner_last_name, 
             u.is_verified as owner_verified
      FROM transports t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    res.json({ cargo, transports });
  } catch (err) {
    console.error('Error fetching admin listings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch listings for moderation' });
  }
});

// DELETE /api/admin/listings/:type/:id - Administrative deletion of spam/policy-violating listings
adminRouter.delete('/listings/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['cargo', 'transport'].includes(type)) {
      return res.status(400).json({ error: 'invalid_type', message: 'Listing type must be cargo or transport' });
    }

    if (type === 'cargo') {
      const existing = await db.queryOne('SELECT id FROM listings WHERE id = $1', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'not_found', message: 'Cargo listing not found' });
      }
      await db.query('DELETE FROM listings WHERE id = $1', [id]);
    } else {
      const existing = await db.queryOne('SELECT id FROM transports WHERE id = $1', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'not_found', message: 'Transport listing not found' });
      }
      await db.query('DELETE FROM transports WHERE id = $1', [id]);
    }

    res.json({
      success: true,
      message: `${type === 'cargo' ? 'Cargo' : 'Transport'} listing deleted by administrator`
    });
  } catch (err) {
    console.error('Error deleting listing in admin:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to delete listing' });
  }
});

// =====================================================================
// SUBSCRIPTION PLANS & REQUESTS (ADMIN)
// =====================================================================

// GET /api/admin/plans - List all plans
adminRouter.get('/plans', async (req, res) => {
  try {
    const plans = await db.queryAll('SELECT * FROM subscription_plans ORDER BY price_uzs ASC');
    res.json({ plans });
  } catch (err) {
    console.error('Error fetching admin plans:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch plans' });
  }
});

// POST /api/admin/plans - Create a plan
adminRouter.post('/plans', async (req, res) => {
  try {
    const {
      name_uz, name_ru, name_en,
      description_uz, description_ru, description_en,
      price_uzs, duration_days, contact_limit,
      is_popular, is_active
    } = req.body;

    if (!name_uz || price_uzs === undefined || !duration_days) {
      return res.status(400).json({ error: 'invalid_params', message: 'Name, price, and duration are required' });
    }

    const now = new Date().toISOString();
    await db.query(`
      INSERT INTO subscription_plans (
        name_uz, name_ru, name_en, description_uz, description_ru, description_en,
        price_uzs, duration_days, contact_limit, is_popular, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      name_uz, name_ru || name_uz, name_en || name_uz,
      description_uz || '', description_ru || '', description_en || '',
      parseInt(price_uzs, 10), parseInt(duration_days, 10),
      contact_limit !== undefined ? parseInt(contact_limit, 10) : -1,
      Boolean(is_popular), is_active !== undefined ? Boolean(is_active) : true,
      now
    ]);

    const newPlan = await db.queryOne('SELECT * FROM subscription_plans ORDER BY id DESC LIMIT 1');
    res.status(201).json({ success: true, plan: newPlan });
  } catch (err) {
    console.error('Error creating plan:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to create plan' });
  }
});

// PATCH /api/admin/plans/:id - Update plan
adminRouter.patch('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await db.queryOne('SELECT * FROM subscription_plans WHERE id = $1', [id]);
    if (!plan) {
      return res.status(404).json({ error: 'not_found', message: 'Plan not found' });
    }

    const fields = ['name_uz', 'name_ru', 'name_en', 'description_uz', 'description_ru', 'description_en', 'price_uzs', 'duration_days', 'contact_limit', 'is_popular', 'is_active'];
    const updates = [];
    const params = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        let val = req.body[f];
        if (f.startsWith('is_')) val = Boolean(val);
        else if (f === 'price_uzs' || f === 'duration_days' || f === 'contact_limit') val = parseInt(val, 10);
        params.push(val);
        updates.push(`${f} = $${params.length}`);
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await db.query(`UPDATE subscription_plans SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
    }

    const updatedPlan = await db.queryOne('SELECT * FROM subscription_plans WHERE id = $1', [id]);
    res.json({ success: true, plan: updatedPlan });
  } catch (err) {
    console.error('Error updating plan:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update plan' });
  }
});

// DELETE /api/admin/plans/:id - Delete plan
adminRouter.delete('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM subscription_plans WHERE id = $1', [id]);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    console.error('Error deleting plan:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to delete plan' });
  }
});

// GET /api/admin/subscription-requests - List all subscription requests
adminRouter.get('/subscription-requests', async (req, res) => {
  try {
    const requests = await db.queryAll(`
      SELECT sr.*, 
             u.email as user_email, 
             u.first_name as user_first_name, 
             u.last_name as user_last_name, 
             u.phone as user_phone,
             sp.name_uz as plan_name_uz,
             sp.name_ru as plan_name_ru,
             sp.name_en as plan_name_en,
             sp.price_uzs as plan_price_uzs,
             sp.duration_days as plan_duration_days
      FROM subscription_requests sr
      JOIN users u ON sr.user_id = u.id
      JOIN subscription_plans sp ON sr.plan_id = sp.id
      ORDER BY sr.created_at DESC
    `);
    res.json({ requests });
  } catch (err) {
    console.error('Error fetching subscription requests:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch subscription requests' });
  }
});

// POST /api/admin/subscription-requests/:id/approve - Approve & activate subscription
adminRouter.post('/subscription-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await db.queryOne('SELECT * FROM subscription_requests WHERE id = $1', [id]);
    if (!request) {
      return res.status(404).json({ error: 'not_found', message: 'Request not found' });
    }

    const plan = await db.queryOne('SELECT * FROM subscription_plans WHERE id = $1', [request.plan_id]);
    if (!plan) {
      return res.status(404).json({ error: 'plan_not_found', message: 'Subscription plan not found' });
    }

    const durationDays = plan.duration_days || 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const shouldVerify = Boolean(plan.is_popular || plan.contact_limit === -1);
    await db.query(`
      UPDATE users 
      SET plan_id = $1, plan_expires_at = $2,
          is_verified = CASE WHEN $3 = true THEN true ELSE is_verified END,
          updated_at = $4
      WHERE id = $5
    `, [plan.id, expiresAt, shouldVerify, now, request.user_id]);

    await db.query(`
      UPDATE subscription_requests 
      SET status = 'approved', updated_at = $1 
      WHERE id = $2
    `, [now, id]);

    res.json({
      success: true,
      message: 'Subscription request approved and activated successfully',
      plan_expires_at: expiresAt
    });
  } catch (err) {
    console.error('Error approving subscription request:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to approve request' });
  }
});

// POST /api/admin/subscription-requests/:id/reject - Reject subscription request
adminRouter.post('/subscription-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();
    await db.query(`
      UPDATE subscription_requests 
      SET status = 'rejected', updated_at = $1 
      WHERE id = $2
    `, [now, id]);
    res.json({ success: true, message: 'Subscription request rejected' });
  } catch (err) {
    console.error('Error rejecting subscription request:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to reject request' });
  }
});

// GET /api/admin/payment-settings - Get payment settings for admin
adminRouter.get('/payment-settings', async (req, res) => {
  try {
    let settings = await db.queryOne('SELECT * FROM payment_settings WHERE id = 1');
    if (!settings) {
      settings = {
        id: 1,
        card_number: '9860 0301 4455 8899',
        card_holder: 'Humo Logistics MCHJ',
        card_bank: 'Humo / Uzcard',
        instructions_uz: 'Click, Payme yoki bank ilovasi orqali to‘lov qiling va quyida chek raqami yoki to‘lovchi ismini qoldiring.',
        instructions_ru: 'Оплатите через Click, Payme или банковское приложение и укажите номер чека или имя плательщика ниже.',
        instructions_en: 'Pay via Click, Payme or banking app and enter your payment receipt number or sender name below.'
      };
    }
    res.json({ settings });
  } catch (err) {
    console.error('Error fetching admin payment settings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch payment settings' });
  }
});

// PUT /api/admin/payment-settings - Update payment card & requisites
const handleUpdatePaymentSettings = async (req, res) => {
  try {
    const {
      card_number,
      card_holder,
      card_bank,
      instructions_uz,
      instructions_ru,
      instructions_en
    } = req.body;

    if (!card_number || !card_holder) {
      return res.status(400).json({ error: 'missing_fields', message: 'Card number and card holder are required' });
    }

    const now = new Date().toISOString();
    const existing = await db.queryOne('SELECT id FROM payment_settings WHERE id = 1');

    if (existing) {
      await db.query(`
        UPDATE payment_settings
        SET card_number = $1,
            card_holder = $2,
            card_bank = $3,
            instructions_uz = $4,
            instructions_ru = $5,
            instructions_en = $6,
            updated_at = $7
        WHERE id = 1
      `, [
        card_number.trim(),
        card_holder.trim(),
        (card_bank || '').trim(),
        (instructions_uz || '').trim(),
        (instructions_ru || '').trim(),
        (instructions_en || '').trim(),
        now
      ]);
    } else {
      await db.query(`
        INSERT INTO payment_settings (
          id, card_number, card_holder, card_bank,
          instructions_uz, instructions_ru, instructions_en, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7
        )
      `, [
        card_number.trim(),
        card_holder.trim(),
        (card_bank || '').trim(),
        (instructions_uz || '').trim(),
        (instructions_ru || '').trim(),
        (instructions_en || '').trim(),
        now
      ]);
    }

    const updated = await db.queryOne('SELECT * FROM payment_settings WHERE id = 1');
    res.json({ success: true, message: 'Payment settings updated successfully', settings: updated });
  } catch (err) {
    console.error('Error updating payment settings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update payment settings' });
  }
};

adminRouter.put('/payment-settings', handleUpdatePaymentSettings);
adminRouter.patch('/payment-settings', handleUpdatePaymentSettings);

// -------------------------------------------------------------
// Support & Social Media Management (Admin)
// -------------------------------------------------------------

// GET /api/admin/support - Get support contact settings & all social links
adminRouter.get('/support', async (req, res) => {
  try {
    let support = await db.queryOne('SELECT * FROM support_settings WHERE id = 1');
    if (!support) {
      support = {
        id: 1,
        phone: '+998 71 200 00 00',
        email: 'support@humologistics.uz',
        telegram_support: 'https://t.me/humo_support',
        whatsapp_support: 'https://wa.me/998901234567',
        working_hours_uz: 'Dushanba - Shanba: 09:00 - 20:00',
        working_hours_ru: 'Понедельник - Суббота: 09:00 - 20:00',
        working_hours_en: 'Monday - Saturday: 09:00 - 20:00',
        address_uz: 'Toshkent sh., Amir Temur shox ko‘chasi, 107-B',
        address_ru: 'г. Ташкент, пр. Амира Темура, 107-Б',
        address_en: 'Tashkent, Amir Temur Ave, 107-B',
        is_widget_enabled: 1,
        is_address_enabled: 1
      };
    }

    const socials = await db.queryAll('SELECT * FROM social_links ORDER BY sort_order ASC, created_at ASC');
    res.json({ support, settings: support, socials });
  } catch (err) {
    console.error('Error fetching admin support data:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch support data' });
  }
});

// PUT /api/admin/support/settings - Update support contact settings
adminRouter.put('/support/settings', async (req, res) => {
  try {
    const {
      phone,
      email,
      telegram_support,
      whatsapp_support,
      working_hours_uz,
      working_hours_ru,
      working_hours_en,
      address_uz,
      address_ru,
      address_en,
      is_widget_enabled,
      is_address_enabled
    } = req.body;

    const now = new Date().toISOString();
    const addrUz = (address_uz || '').trim();
    const addrRu = (address_ru || '').trim();
    const addrEn = (address_en || '').trim();
    const hasAnyAddress = Boolean(addrUz || addrRu || addrEn);
    const addressEnabled = is_address_enabled !== undefined
      ? Boolean(is_address_enabled && hasAnyAddress)
      : Boolean(hasAnyAddress);
    const widgetEnabled = Boolean(is_widget_enabled !== false);

    const existing = await db.queryOne('SELECT id FROM support_settings WHERE id = 1');

    if (existing) {
      await db.query(`
        UPDATE support_settings
        SET phone = $1,
            email = $2,
            telegram_support = $3,
            whatsapp_support = $4,
            working_hours_uz = $5,
            working_hours_ru = $6,
            working_hours_en = $7,
            address_uz = $8,
            address_ru = $9,
            address_en = $10,
            is_widget_enabled = $11,
            is_address_enabled = $12,
            updated_at = $13
        WHERE id = 1
      `, [
        (phone || '').trim(),
        (email || '').trim(),
        (telegram_support || '').trim(),
        (whatsapp_support || '').trim(),
        (working_hours_uz || '').trim(),
        (working_hours_ru || '').trim(),
        (working_hours_en || '').trim(),
        addrUz,
        addrRu,
        addrEn,
        widgetEnabled,
        addressEnabled,
        now
      ]);
    } else {
      await db.query(`
        INSERT INTO support_settings (
          id, phone, email, telegram_support, whatsapp_support,
          working_hours_uz, working_hours_ru, working_hours_en,
          address_uz, address_ru, address_en, is_widget_enabled, is_address_enabled, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `, [
        (phone || '').trim(),
        (email || '').trim(),
        (telegram_support || '').trim(),
        (whatsapp_support || '').trim(),
        (working_hours_uz || '').trim(),
        (working_hours_ru || '').trim(),
        (working_hours_en || '').trim(),
        addrUz,
        addrRu,
        addrEn,
        widgetEnabled,
        addressEnabled,
        now
      ]);
    }

    const updated = await db.queryOne('SELECT * FROM support_settings WHERE id = 1');
    res.json({ success: true, message: 'Support settings updated successfully', support: updated, settings: updated });
  } catch (err) {
    console.error('Error updating support settings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update support settings' });
  }
});

// POST /api/admin/support/socials - Add new social media link
adminRouter.post('/support/socials', async (req, res) => {
  try {
    const { platform, title, url, sort_order, is_active } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ error: 'missing_fields', message: 'Platform and URL are required' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const order = Number.isInteger(sort_order) ? sort_order : 0;
    const active = Boolean(is_active !== false);

    await db.query(`
      INSERT INTO social_links (id, platform, title, url, sort_order, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      id,
      platform.trim().toLowerCase(),
      (title || platform).trim(),
      url.trim(),
      order,
      active,
      now
    ]);

    const created = await db.queryOne('SELECT * FROM social_links WHERE id = $1', [id]);
    res.status(201).json({ success: true, message: 'Social link created successfully', social: created });
  } catch (err) {
    console.error('Error adding social link:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to add social link' });
  }
});

// PUT /api/admin/support/socials/:id - Update existing social media link
adminRouter.put('/support/socials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, title, url, sort_order, is_active } = req.body;

    const existing = await db.queryOne('SELECT id FROM social_links WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'not_found', message: 'Social link not found' });
    }

    const order = Number.isInteger(sort_order) ? sort_order : 0;
    const active = Boolean(is_active !== false);

    await db.query(`
      UPDATE social_links
      SET platform = $1,
          title = $2,
          url = $3,
          sort_order = $4,
          is_active = $5
      WHERE id = $6
    `, [
      (platform || '').trim().toLowerCase(),
      (title || platform || '').trim(),
      (url || '').trim(),
      order,
      active,
      id
    ]);

    const updated = await db.queryOne('SELECT * FROM social_links WHERE id = $1', [id]);
    res.json({ success: true, message: 'Social link updated successfully', social: updated });
  } catch (err) {
    console.error('Error updating social link:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update social link' });
  }
});

// DELETE /api/admin/support/socials/:id - Delete social link
adminRouter.delete('/support/socials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM social_links WHERE id = $1', [id]);
    res.json({ success: true, message: 'Social link deleted successfully' });
  } catch (err) {
    console.error('Error deleting social link:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to delete social link' });
  }
});

// Channels & Groups Management Endpoints
// GET /api/admin/channels - List channels for management
adminRouter.get('/channels', async (req, res) => {
  try {
    const channels = await db.queryAll('SELECT * FROM channels ORDER BY is_pinned DESC, created_at DESC');
    res.json({ channels });
  } catch (err) {
    console.error('Error fetching admin channels:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch channels' });
  }
});

// POST /api/admin/channels - Create channel or group
adminRouter.post('/channels', async (req, res) => {
  try {
    const { name, description, type, icon, is_pinned } = req.body;
    const trimmedName = (name || '').toString().trim();
    if (!trimmedName) {
      return res.status(400).json({ error: 'invalid_name', message: 'Kanal yoki guruh nomi kiritilishi shart' });
    }

    const channelType = type === 'channel' ? 'channel' : 'group';
    const channelIcon = icon || (channelType === 'channel' ? 'Megaphone' : 'Users');
    const isPinned = Boolean(is_pinned);

    const slugBase = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const channelId = `ch_${slugBase || 'group'}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO channels (id, name, description, type, icon, is_pinned, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      channelId,
      trimmedName,
      (description || '').toString().trim(),
      channelType,
      channelIcon,
      isPinned,
      req.user.id,
      now,
      now
    ]);

    const createdChannel = await db.queryOne('SELECT * FROM channels WHERE id = $1', [channelId]);
    res.status(201).json({ success: true, channel: createdChannel });
  } catch (err) {
    console.error('Error creating channel in admin:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to create channel' });
  }
});

// DELETE /api/admin/channels/:id - Delete channel
adminRouter.delete('/channels/:id', async (req, res) => {
  try {
    const channelId = req.params.id;
    if (channelId === 'dispetcherlar-va-yuk-egalari' || channelId === 'haydovchilar-guruhi') {
      return res.status(400).json({
        error: 'protected_channel',
        message: 'Rasmiy asosiy guruhlarni o‘chirib bo‘lmaydi'
      });
    }

    await db.query('DELETE FROM channels WHERE id = $1', [channelId]);
    res.json({ success: true, message: 'Channel deleted successfully' });
  } catch (err) {
    console.error('Error deleting channel in admin:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to delete channel' });
  }
});
