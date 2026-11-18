import { Router } from 'express';
import crypto from 'node:crypto';
import { db, isPg } from '../db.js';
import { requireAuth } from '../auth.js';

export const loadRouter = Router();

/**
 * TELEFON RAQAMNI MASKALASH UTILITY
 * +998901234545 yoki +998 90 123 45 45 kabi raqamni
 * +998 90 *** ** 45 formatiga o'tkazadi
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  // Standart O'zbekiston raqamlari (+998...)
  if (digits.startsWith('998') && digits.length >= 12) {
    const code = digits.slice(0, 3);
    const operator = digits.slice(3, 5);
    const last2 = digits.slice(-2);
    return `+${code} ${operator} *** ** ${last2}`;
  }

  // 9 xonali mahalliy raqam (masalan 901234545)
  if (digits.length === 9) {
    const operator = digits.slice(0, 2);
    const last2 = digits.slice(-2);
    return `+998 ${operator} *** ** ${last2}`;
  }

  // Xalqaro boshqa raqamlar
  if (digits.length > 4) {
    const firstPart = phone.startsWith('+') ? phone.slice(0, 5) : phone.slice(0, 4);
    const last2 = digits.slice(-2);
    return `${firstPart} *** ** ${last2}`;
  }

  return phone;
}

/**
 * Foydalanuvchining ma'lum yuk bo'yicha telefon raqamini ko'rish huquqini tekshirish
 * Shart:
 * 1) Foydalanuvchi tizimga kirgan bo'lishi shart
 * 2) Yuk egasining o'zi bo'lsa (load.owner_id === req.user.id)
 * 3) contact_reveals jadvalida (load_id, viewer_id) yozuvi mavjud bo'lsa
 */
async function checkPhoneRevealed(loadId, ownerId, user) {
  if (!user || !user.id) {
    return false;
  }
  // Yuk egasining o'ziga har doim ochiq
  if (user.id === ownerId) {
    return true;
  }
  // contact_reveals jadvalida mavjudligini tekshirish
  const reveal = await db.queryOne(
    'SELECT id FROM contact_reveals WHERE load_id = $1 AND viewer_id = $2 LIMIT 1',
    [loadId, user.id]
  );
  return Boolean(reveal);
}

/**
 * Yuklar ro'yxatini qayta ishlab, telefon raqamlarini maskalash/ochish
 */
async function processLoadsPhone(loads, user) {
  if (!Array.isArray(loads) || loads.length === 0) return loads;

  let revealedLoadIds = new Set();
  if (user && user.id) {
    const reveals = await db.queryAll(
      'SELECT load_id FROM contact_reveals WHERE viewer_id = $1',
      [user.id]
    );
    revealedLoadIds = new Set(reveals.map(r => r.load_id));
  }

  return loads.map(load => {
    const isOwner = user && user.id && user.id === load.owner_id;
    const isRevealed = isOwner || revealedLoadIds.has(load.id);
    const realPhone = load.phone || null;

    return {
      ...load,
      phone: isRevealed ? realPhone : maskPhone(realPhone),
      raw_phone_available: Boolean(realPhone),
      is_phone_revealed: Boolean(isRevealed)
    };
  });
}

/**
 * GET /api/loads
 * Yuklar ro'yxati (telefon raqamlari sukut bo'yicha MASKALANGAN)
 */
loadRouter.get('/', async (req, res) => {
  try {
    const { origin_city, destination_city, status = 'active', limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT l.*, 
             u.first_name as owner_first_name,
             u.last_name as owner_last_name,
             u.role as owner_role,
             u.active_role as owner_active_role,
             u.is_verified as owner_verified
      FROM loads l
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND l.status = $${params.length}`;
    }

    if (origin_city) {
      params.push(`%${origin_city}%`);
      query += ` AND l.origin_city ILIKE $${params.length}`;
    }

    if (destination_city) {
      params.push(`%${destination_city}%`);
      query += ` AND l.destination_city ILIKE $${params.length}`;
    }

    query += ' ORDER BY l.created_at DESC';

    params.push(Math.min(100, Math.max(1, parseInt(limit, 10) || 50)));
    query += ` LIMIT $${params.length}`;

    params.push(Math.max(0, parseInt(offset, 10) || 0));
    query += ` OFFSET $${params.length}`;

    const rawLoads = await db.queryAll(query, params);
    const processedLoads = await processLoadsPhone(rawLoads, req.user);

    return res.json({
      success: true,
      count: processedLoads.length,
      loads: processedLoads
    });
  } catch (err) {
    console.error('Error fetching loads:', err);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Yuklar ro‘yxatini yuklashda xatolik yuz berdi'
    });
  }
});

/**
 * GET /api/loads/:id
 * Bitta yuk haqida to'liq ma'lumot
 */
loadRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const load = await db.queryOne(`
      SELECT l.*, 
             u.first_name as owner_first_name,
             u.last_name as owner_last_name,
             u.role as owner_role,
             u.active_role as owner_active_role,
             u.is_verified as owner_verified
      FROM loads l
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (!load) {
      return res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Yuk topilmadi'
      });
    }

    const isRevealed = await checkPhoneRevealed(load.id, load.owner_id, req.user);
    const realPhone = load.phone || null;

    const processedLoad = {
      ...load,
      phone: isRevealed ? realPhone : maskPhone(realPhone),
      raw_phone_available: Boolean(realPhone),
      is_phone_revealed: Boolean(isRevealed)
    };

    return res.json({
      success: true,
      load: processedLoad
    });
  } catch (err) {
    console.error('Error fetching load details:', err);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Yuk ma‘lumotlarini olishda xatolik yuz berdi'
    });
  }
});

/**
 * POST /api/loads
 * Yangi yuk e'lonini joylashtirish (foydalanuvchi tizimga kirgan bo'lishi shart)
 */
loadRouter.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      cargo_type = 'Umumiy yuk',
      weight_tons,
      volume_m3,
      origin_city,
      destination_city,
      pickup_date,
      delivery_date,
      price,
      currency = 'UZS',
      phone
    } = req.body;

    if (!title || !origin_city || !destination_city) {
      return res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'Yuk nomi (title), jo‘nash shahri (origin_city) va yetkazish shahri (destination_city) majburiy'
      });
    }

    const newId = crypto.randomUUID();
    const contactPhone = phone || req.user.phone || null;
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO loads (
        id, owner_id, title, cargo_type, weight_tons, volume_m3,
        origin_city, destination_city, pickup_date, delivery_date,
        price, currency, phone, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, 'active', $14, $14
      )
    `, [
      newId,
      req.user.id,
      title.trim(),
      cargo_type,
      weight_tons ? parseFloat(weight_tons) : null,
      volume_m3 ? parseFloat(volume_m3) : null,
      origin_city.trim(),
      destination_city.trim(),
      pickup_date || null,
      delivery_date || null,
      price ? parseFloat(price) : null,
      currency,
      contactPhone,
      now
    ]);

    const created = await db.queryOne('SELECT * FROM loads WHERE id = $1', [newId]);

    return res.status(201).json({
      success: true,
      message: 'Yuk e‘loni muvaffaqiyatli yaratildi',
      load: {
        ...created,
        is_phone_revealed: true
      }
    });
  } catch (err) {
    console.error('Error creating load:', err);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Yuk e‘lonini yaratishda xatolik yuz berdi'
    });
  }
});

/**
 * POST /api/loads/:id/reveal-phone
 * Dispetcher/haydovchi telefon raqamini ochish (Reveal Phone)
 * 
 * Qoidalar:
 * 1. JWT auth middleware bilan himoyalangan (requireAuth).
 * 2. Foydalanuvchi tasdiqlangan bo'lishi shart (is_verified === true), aks holda 403.
 * 3. Anti-scraping: oxirgi 24 soatda ochilgan raqamlar soni 20 tadan oshsa 429 ("Kunlik limit tugadi").
 * 4. contact_reveals jadvaliga ON CONFLICT DO NOTHING bilan saqlanadi.
 * 5. { success: true, phone: realPhone, is_phone_revealed: true } qaytariladi.
 */
loadRouter.post('/:id/reveal-phone', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user.id;

    // 1. Foydalanuvchining is_verified holatini tekshirish
    const currentUser = await db.queryOne(
      'SELECT id, is_verified, phone FROM users WHERE id = $1',
      [viewerId]
    );

    if (!currentUser || !currentUser.is_verified) {
      return res.status(403).json({
        success: false,
        error: 'verification_required',
        message: "Telefon raqamini ko‘rish uchun profilingiz tasdiqlangan (is_verified: true) bo‘lishi shart"
      });
    }

    // 2. Yuk mavjudligini va egasining telefonini topish
    const load = await db.queryOne(
      'SELECT id, owner_id, phone FROM loads WHERE id = $1',
      [id]
    );

    if (!load) {
      return res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Yuk topilmadi'
      });
    }

    const realPhone = load.phone;
    if (!realPhone) {
      return res.status(404).json({
        success: false,
        error: 'no_phone_available',
        message: 'Ushbu e‘lon uchun telefon raqam kiritilmagan'
      });
    }

    // Agar foydalanuvchi yukning o'z egasi bo'lsa, limitni kamaytirmasdan darhol qaytaramiz
    if (load.owner_id === viewerId) {
      return res.json({
        success: true,
        phone: realPhone,
        is_phone_revealed: true,
        message: 'Bu sizning o‘z e‘loningiz'
      });
    }

    // 3. Anti-scraping: oxirgi 24 soatda ochilgan raqamlar sonini sanash
    const timeFilterSql = isPg
      ? "NOW() - INTERVAL '24 hours'"
      : "datetime('now', '-1 day')";

    const recentReveals = await db.queryOne(`
      SELECT COUNT(*) as count 
      FROM contact_reveals 
      WHERE viewer_id = $1 AND revealed_at > ${timeFilterSql}
    `, [viewerId]);

    const countRevealedLast24h = parseInt(recentReveals?.count || '0', 10);
    const DAILY_LIMIT = 20;

    // Agar oldin allaqachon shu yukni ochgan bo'lsa, limitdan qayta yemasdan ochib beramiz
    const alreadyRevealed = await db.queryOne(
      'SELECT id FROM contact_reveals WHERE load_id = $1 AND viewer_id = $2 LIMIT 1',
      [load.id, viewerId]
    );

    if (!alreadyRevealed && countRevealedLast24h >= DAILY_LIMIT) {
      return res.status(429).json({
        success: false,
        error: 'daily_limit_exceeded',
        limit: DAILY_LIMIT,
        used: countRevealedLast24h,
        message: 'Kunlik limit tugadi (oxirgi 24 soatda maksimal 20 ta raqam ochish mumkin)'
      });
    }

    // 4. contact_reveals jadvaliga ON CONFLICT DO NOTHING bilan yozuv kiritish
    const revealId = crypto.randomUUID();
    const now = new Date().toISOString();

    if (isPg) {
      await db.query(`
        INSERT INTO contact_reveals (id, load_id, viewer_id, owner_id, revealed_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (load_id, viewer_id) DO NOTHING
      `, [revealId, load.id, viewerId, load.owner_id]);
    } else {
      await db.query(`
        INSERT OR IGNORE INTO contact_reveals (id, load_id, viewer_id, owner_id, revealed_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [revealId, load.id, viewerId, load.owner_id, now]);
    }

    const remainingDaily = Math.max(0, DAILY_LIMIT - (countRevealedLast24h + (alreadyRevealed ? 0 : 1)));

    // 5. Haqiqiy telefon raqamini qaytarish
    return res.json({
      success: true,
      phone: realPhone,
      is_phone_revealed: true,
      remaining_daily: remainingDaily,
      message: 'Telefon raqam muvaffaqiyatli ochildi'
    });
  } catch (err) {
    console.error('Error revealing phone:', err);
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Telefon raqamini ochishda xatolik yuz berdi'
    });
  }
});
