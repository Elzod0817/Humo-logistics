import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

export const subscriptionRouter = Router();

// Phone masking helper
export function maskPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, '');
  if (digits.length < 8) return '+998 ** *** ** **';
  if (digits.startsWith('+998') && digits.length >= 12) {
    const operator = digits.slice(4, 6);
    return `+998 ${operator} *** ** **`;
  }
  const prefix = digits.slice(0, 5);
  return `${prefix} *** ** **`;
}

// Check if user can view phone without deducting credits
export async function canViewPhone(user, listingType, listingId, ownerId) {
  if (!user) return false;
  if (user.id === ownerId) return true;
  if (user.role === 'admin') return true;
  if (user.plan_expires_at && new Date(user.plan_expires_at) > new Date()) return true;
  
  const unlocked = await db.queryOne(`
    SELECT id FROM unlocked_contacts 
    WHERE user_id = $1 AND listing_type = $2 AND listing_id = $3
  `, [user.id, listingType, listingId]);
  return Boolean(unlocked);
}

// Helper to batch process listings with masked/unmasked phone
export async function processListingPhones(listings, user, listingType) {
  if (!Array.isArray(listings) || listings.length === 0) return listings;

  let canViewAll = false;
  let unlockedSet = new Set();

  if (user) {
    if (user.role === 'admin' || (user.plan_expires_at && new Date(user.plan_expires_at) > new Date())) {
      canViewAll = true;
    } else {
      const rows = await db.queryAll(`
        SELECT listing_id FROM unlocked_contacts 
        WHERE user_id = $1 AND listing_type = $2
      `, [user.id, listingType]);
      unlockedSet = new Set(rows.map(r => r.listing_id));
    }
  }

  return listings.map(item => {
    const rawPhone = item.phone || item.owner_phone;
    const isOwner = user ? user.id === item.user_id : false;
    const isUnlocked = canViewAll || isOwner || unlockedSet.has(item.id);

    return {
      ...item,
      phone: isUnlocked ? rawPhone : maskPhone(rawPhone),
      owner_phone: isUnlocked ? rawPhone : maskPhone(rawPhone),
      is_phone_unlocked: isUnlocked
    };
  });
}

// 1. GET /api/subscriptions/plans - All active subscription plans
subscriptionRouter.get('/plans', async (req, res) => {
  try {
    const plans = await db.queryAll(`
      SELECT * FROM subscription_plans 
      WHERE is_active = true
      ORDER BY price_uzs ASC
    `);
    res.json({ plans });
  } catch (err) {
    console.error('Error fetching subscription plans:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch plans' });
  }
});

// GET /api/subscriptions/payment-settings - Payment card & requisites for users
subscriptionRouter.get('/payment-settings', async (req, res) => {
  try {
    const settings = await db.queryOne('SELECT * FROM payment_settings WHERE id = 1');
    if (!settings) {
      return res.json({
        settings: {
          id: 1,
          card_number: '9860 0301 4455 8899',
          card_holder: 'Humo Logistics MCHJ',
          card_bank: 'Humo / Uzcard',
          instructions_uz: 'Click, Payme yoki bank ilovasi orqali to‘lov qiling va quyida chek raqami yoki to‘lovchi ismini qoldiring.',
          instructions_ru: 'Оплатите через Click, Payme или банковское приложение и укажите номер чека или имя плательщика ниже.',
          instructions_en: 'Pay via Click, Payme or banking app and enter your payment receipt number or sender name below.'
        }
      });
    }
    res.json({ settings });
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch payment settings' });
  }
});

// 2. GET /api/subscriptions/my-status - User subscription status & unlocked contacts
subscriptionRouter.get('/my-status', requireAuth, async (req, res) => {
  try {
    const user = await db.queryOne(`
      SELECT id, email, role, is_verified, free_contacts_remaining, plan_id, plan_expires_at 
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'user_not_found', message: 'User not found' });
    }

    const freeRemaining = Number(user.free_contacts_remaining ?? 117);
    const isPlanActive = Boolean(user.plan_expires_at && new Date(user.plan_expires_at) > new Date());

    let plan = null;
    if (user.plan_id) {
      plan = await db.queryOne('SELECT * FROM subscription_plans WHERE id = $1', [user.plan_id]);
    }

    // Get list of unlocked listing IDs
    const unlockedRows = await db.queryAll(`
      SELECT listing_type, listing_id, created_at 
      FROM unlocked_contacts 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [user.id]);

    // Check for pending upgrade request
    const pendingRequest = await db.queryOne(`
      SELECT sr.*, sp.name_uz, sp.name_ru, sp.name_en, sp.price_uzs 
      FROM subscription_requests sr
      JOIN subscription_plans sp ON sr.plan_id = sp.id
      WHERE sr.user_id = $1 AND sr.status = 'pending'
      ORDER BY sr.created_at DESC
      LIMIT 1
    `, [user.id]);

    res.json({
      free_contacts_remaining: freeRemaining,
      is_plan_active: isPlanActive,
      has_active_plan: isPlanActive,
      has_unlimited_contacts: Boolean(isPlanActive && plan && plan.contact_limit === -1),
      plan_name: plan ? plan.name_uz : null,
      plan_expires_at: user.plan_expires_at,
      plan,
      unlocked_contacts: unlockedRows,
      pending_request: pendingRequest || null
    });
  } catch (err) {
    console.error('Error fetching subscription status:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch subscription status' });
  }
});

// 3. POST /api/subscriptions/unlock-contact - Unlock a contact phone number
export async function handleUnlockContact(req, res) {
  try {
    const { listing_type, listing_id } = req.body;

    if (!listing_type || !['cargo', 'transport'].includes(listing_type) || !listing_id) {
      return res.status(400).json({ error: 'invalid_params', message: 'listing_type (cargo|transport) and listing_id required' });
    }

    // Fetch listing and owner phone
    let rawPhone = null;
    let ownerId = null;

    if (listing_type === 'cargo') {
      const listing = await db.queryOne(`
        SELECT l.id, l.user_id, u.phone as owner_phone 
        FROM listings l 
        JOIN users u ON l.user_id = u.id 
        WHERE l.id = $1
      `, [listing_id]);

      if (!listing) {
        return res.status(404).json({ error: 'not_found', message: 'Cargo listing not found' });
      }
      rawPhone = listing.owner_phone;
      ownerId = listing.user_id;
    } else {
      const transport = await db.queryOne(`
        SELECT t.id, t.user_id, t.phone, u.phone as owner_phone 
        FROM transports t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.id = $1
      `, [listing_id]);

      if (!transport) {
        return res.status(404).json({ error: 'not_found', message: 'Transport listing not found' });
      }
      rawPhone = transport.phone || transport.owner_phone;
      ownerId = transport.user_id;
    }

    // Refresh current user info from DB
    const user = await db.queryOne(`
      SELECT id, role, is_verified, free_contacts_remaining, plan_id, plan_expires_at 
      FROM users WHERE id = $1
    `, [req.user.id]);

    const isOwner = user.id === ownerId;
    const isAdmin = user.role === 'admin';
    const hasActiveUnlimited = Boolean(user.plan_expires_at && new Date(user.plan_expires_at) > new Date());

    // Check if already unlocked in unlocked_contacts
    const alreadyUnlocked = await db.queryOne(`
      SELECT id FROM unlocked_contacts 
      WHERE user_id = $1 AND listing_type = $2 AND listing_id = $3
    `, [user.id, listing_type, listing_id]);

    if (isOwner || isAdmin || hasActiveUnlimited || alreadyUnlocked) {
      return res.json({
        success: true,
        phone: rawPhone,
        free_contacts_remaining: Number(user.free_contacts_remaining ?? 117),
        already_unlocked: true
      });
    }

    // Check if user has free contacts remaining
    const currentRemaining = Number(user.free_contacts_remaining ?? 117);
    if (currentRemaining <= 0) {
      return res.status(402).json({
        error: 'limit_exhausted',
        message: 'Bepul kontaktlar limiti (117 ta) tugadi. Davom etish uchun obuna faollashtiring.'
      });
    }

    // Decrement free_contacts_remaining and record in unlocked_contacts
    const newRemaining = currentRemaining - 1;
    await db.query(`
      UPDATE users 
      SET free_contacts_remaining = $1 
      WHERE id = $2
    `, [newRemaining, user.id]);

    const unlockId = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(`
      INSERT INTO unlocked_contacts (id, user_id, listing_type, listing_id, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [unlockId, user.id, listing_type, listing_id, now]);

    return res.json({
      success: true,
      phone: rawPhone,
      free_contacts_remaining: newRemaining,
      already_unlocked: false,
      unlocked: true
    });
  } catch (err) {
    console.error('Error unlocking contact:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to unlock contact' });
  }
}

subscriptionRouter.post('/unlock-contact', requireAuth, handleUnlockContact);

// 4. POST /api/subscriptions/request - Submit a subscription upgrade request
subscriptionRouter.post('/request', requireAuth, async (req, res) => {
  try {
    const { plan_id, receipt_note } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: 'missing_plan_id', message: 'plan_id is required' });
    }

    const plan = await db.queryOne('SELECT * FROM subscription_plans WHERE id = $1', [plan_id]);
    if (!plan) {
      return res.status(404).json({ error: 'plan_not_found', message: 'Subscription plan not found' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO subscription_requests (id, user_id, plan_id, receipt_note, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'pending', $5, $6)
    `, [id, req.user.id, plan_id, receipt_note || null, now, now]);

    res.status(201).json({
      success: true,
      message: 'Obuna so‘rovingiz qabul qilindi. Tez orada ma’muriyat tomonidan faollashtiriladi.',
      request_id: id,
      request: {
        id,
        user_id: req.user.id,
        plan_id,
        receipt_note: receipt_note || null,
        status: 'pending',
        created_at: now
      }
    });
  } catch (err) {
    console.error('Error submitting subscription request:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to submit request' });
  }
});
