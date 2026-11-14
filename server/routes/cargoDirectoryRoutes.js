import { Router } from 'express';
import crypto from 'node:crypto';
import { db, isPg } from '../db.js';
import { requireAuth } from '../auth.js';

export const cargoDirectoryRouter = Router();

export function normalizeCargoCompany(c) {
  if (!c) return null;
  return {
    ...c,
    is_verified: Boolean(c.is_verified),
    origin_regions: typeof c.origin_regions === 'string' ? safeJsonParse(c.origin_regions, []) : (c.origin_regions || []),
    destination_regions: typeof c.destination_regions === 'string' ? safeJsonParse(c.destination_regions, []) : (c.destination_regions || []),
    delivery_modes: typeof c.delivery_modes === 'string' ? safeJsonParse(c.delivery_modes, []) : (c.delivery_modes || []),
    services: typeof c.services === 'string' ? safeJsonParse(c.services, []) : (c.services || []),
    rating: Number(c.rating || 4.8),
    min_weight_kg: Number(c.min_weight_kg || 1),
    price_per_kg_usd: c.price_per_kg_usd != null ? Number(c.price_per_kg_usd) : null,
    price_per_kg_uzs: c.price_per_kg_uzs != null ? Number(c.price_per_kg_uzs) : null,
  };
}

function safeJsonParse(str, fallback = []) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// GET /api/cargo-directory - List cargo companies with filters
cargoDirectoryRouter.get('/', async (req, res) => {
  try {
    const { category, search, origin, destination } = req.query;

    let query = 'SELECT * FROM cargo_companies WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category.trim().toLowerCase());
      query += ` AND category = $${params.length}`;
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term);
      const idx = params.length;
      query += ` AND (LOWER(name) LIKE $${idx} OR LOWER(origin_regions) LIKE $${idx} OR LOWER(destination_regions) LIKE $${idx} OR LOWER(COALESCE(address, '')) LIKE $${idx})`;
    }

    if (origin && origin.trim()) {
      const term = `%${origin.trim().toLowerCase()}%`;
      params.push(term);
      query += ` AND LOWER(origin_regions) LIKE $${params.length}`;
    }

    if (destination && destination.trim()) {
      const term = `%${destination.trim().toLowerCase()}%`;
      params.push(term);
      query += ` AND LOWER(destination_regions) LIKE $${params.length}`;
    }

    // Verified first, then highest rating, then newest
    query += ' ORDER BY is_verified DESC, rating DESC, created_at DESC';

    const rows = await db.queryAll(query, params);
    const companies = rows.map(normalizeCargoCompany);

    res.json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (err) {
    console.error('Error fetching cargo directory:', err);
    res.status(500).json({ error: 'server_error', message: 'Kargo kompaniyalarini olishda xatolik yuz berdi' });
  }
});

// GET /api/cargo-directory/:id - Single company details
cargoDirectoryRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row = await db.queryOne('SELECT * FROM cargo_companies WHERE id = $1', [id]);
    if (!row) {
      return res.status(404).json({ error: 'not_found', message: 'Kargo kompaniyasi topilmadi' });
    }
    res.json({ success: true, company: normalizeCargoCompany(row) });
  } catch (err) {
    console.error('Error fetching cargo company details:', err);
    res.status(500).json({ error: 'server_error', message: 'Kompaniya ma’lumotlarini olishda xatolik' });
  }
});

// POST /api/cargo-directory/apply - Submit new cargo company listing
cargoDirectoryRouter.post('/apply', requireAuth, async (req, res) => {
  try {
    const {
      name,
      category = 'international',
      origin_regions = [],
      destination_regions = [],
      delivery_modes = [],
      price_per_kg_usd = null,
      price_per_kg_uzs = null,
      min_weight_kg = 1,
      delivery_days = '12-16 kun',
      services = [],
      phone,
      address = '',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'bad_request', message: 'Kargo kompaniyasi nomini kiritish shart' });
    }

    const contactPhone = (phone || req.user.phone || '').trim();
    if (!contactPhone) {
      return res.status(400).json({ error: 'bad_request', message: 'Aloqa uchun telefon raqami kiritilishi shart' });
    }

    const id = crypto.randomUUID();
    const isAdmin = req.user.role === 'admin';
    const isVerified = isAdmin ? (isPg ? true : 1) : (isPg ? false : 0);
    const now = new Date().toISOString();

    const originJson = Array.isArray(origin_regions) ? JSON.stringify(origin_regions) : JSON.stringify([origin_regions]);
    const destJson = Array.isArray(destination_regions) ? JSON.stringify(destination_regions) : JSON.stringify([destination_regions]);
    const modesJson = Array.isArray(delivery_modes) ? JSON.stringify(delivery_modes) : JSON.stringify([delivery_modes]);
    const servicesJson = Array.isArray(services) ? JSON.stringify(services) : JSON.stringify([services]);

    const usdPrice = price_per_kg_usd !== null && price_per_kg_usd !== undefined && price_per_kg_usd !== '' ? Number(price_per_kg_usd) : null;
    const uzsPrice = price_per_kg_uzs !== null && price_per_kg_uzs !== undefined && price_per_kg_uzs !== '' ? Number(price_per_kg_uzs) : null;
    const minWeight = Number(min_weight_kg) || 1;

    await db.query(`
      INSERT INTO cargo_companies (
        id, user_id, name, category, origin_regions, destination_regions,
        delivery_modes, price_per_kg_usd, price_per_kg_uzs, min_weight_kg,
        delivery_days, services, phone, address, is_verified, rating, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 4.8, $16, $17
      )
    `, [
      id, req.user.id, name.trim(), category, originJson, destJson,
      modesJson, usdPrice, uzsPrice, minWeight,
      delivery_days || '10-15 kun', servicesJson, contactPhone, address ? address.trim() : '',
      isVerified, now, now
    ]);

    const created = await db.queryOne('SELECT * FROM cargo_companies WHERE id = $1', [id]);

    res.status(201).json({
      success: true,
      company: normalizeCargoCompany(created),
      message: isAdmin
        ? 'Kargo kompaniyasi darhol tasdiqlandi va e’lon qilindi'
        : 'Arizangiz qabul qilindi. Administrator tekshiruvidan so‘ng katalogda e’lon qilinadi.',
    });
  } catch (err) {
    console.error('Error applying for cargo directory:', err);
    res.status(500).json({ error: 'server_error', message: 'Ariza yuborishda xatolik yuz berdi' });
  }
});
