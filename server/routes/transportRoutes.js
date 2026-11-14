import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireProfileComplete } from '../auth.js';
import { BODY_TYPES, getCountry } from '../locations.js';
import { processListingPhones, canViewPhone, maskPhone, handleUnlockContact } from './subscriptionRoutes.js';

export const transportRouter = Router();

// Public Transport Search with filters and sorting
transportRouter.get('/', async (req, res) => {
  try {
    const {
      origin_country,
      origin_city,
      destination_country,
      destination_city,
      body_type,
      sort
    } = req.query;

    let query = `
      SELECT 
        t.id,
        t.user_id,
        t.origin_country,
        t.origin_city,
        t.destination_country,
        t.destination_city,
        t.body_type,
        t.truck_model,
        t.max_weight,
        t.volume,
        t.available_date,
        t.price_expectation,
        t.phone,
        t.notes,
        t.status,
        t.created_at,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.role as owner_role,
        u.is_verified as owner_verified
      FROM transports t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'active'
    `;

    const params = [];

    if (origin_country) {
      params.push(origin_country);
      query += ` AND t.origin_country = $${params.length}`;
    }

    if (origin_city) {
      params.push(origin_city);
      query += ` AND t.origin_city = $${params.length}`;
    }

    if (destination_country) {
      params.push(destination_country);
      query += ` AND (t.destination_country = $${params.length} OR t.destination_country IS NULL OR t.destination_country = '' OR t.destination_country = 'ANY')`;
    }

    if (destination_city) {
      params.push(destination_city);
      query += ` AND (t.destination_city = $${params.length} OR t.destination_city IS NULL OR t.destination_city = '')`;
    }

    if (body_type) {
      params.push(body_type);
      query += ` AND t.body_type = $${params.length}`;
    }

    if (sort === 'weight_desc') {
      query += ' ORDER BY t.max_weight DESC, t.created_at DESC';
    } else if (sort === 'weight_asc') {
      query += ' ORDER BY t.max_weight ASC, t.created_at DESC';
    } else {
      query += ' ORDER BY t.created_at DESC';
    }

    const rawTransports = await db.queryAll(query, params);
    const transports = await processListingPhones(rawTransports, req.user, 'transport');
    res.json({ transports });
  } catch (err) {
    console.error('Error searching transports:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to search transports' });
  }
});

// Current user's transport listings (both active and closed)
transportRouter.get('/my', requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM transports
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const transports = await db.queryAll(query, [req.user.id]);
    res.json({ transports });
  } catch (err) {
    console.error('Error fetching user transports:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch your transports' });
  }
});

// Single transport detail
transportRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        t.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.role as owner_role,
        u.is_verified as owner_verified
      FROM transports t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    const transport = await db.queryOne(query, [id]);

    if (!transport) {
      return res.status(404).json({ error: 'not_found', message: 'Transport not found' });
    }

    const isOwner = req.user ? req.user.id === transport.user_id : false;
    const isUnlocked = await canViewPhone(req.user, 'transport', transport.id, transport.user_id);
    res.json({
      transport: {
        ...transport,
        phone: isUnlocked ? transport.phone : maskPhone(transport.phone),
        is_phone_unlocked: isUnlocked,
        is_owner: isOwner
      }
    });
  } catch (err) {
    console.error('Error fetching transport:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch transport' });
  }
});

// Unlock transport contact phone
transportRouter.post('/:id/unlock', requireAuth, (req, res) => {
  req.body.listing_type = 'transport';
  req.body.listing_id = req.params.id;
  return handleUnlockContact(req, res);
});

// Create new transport listing
transportRouter.post('/', requireAuth, requireProfileComplete, async (req, res) => {
  try {
    const {
      origin_country,
      origin_city,
      destination_country,
      destination_city,
      body_type,
      truck_model,
      max_weight,
      volume,
      available_date,
      price_expectation,
      phone,
      notes
    } = req.body;

    const errors = {};

    if (!getCountry(origin_country)) {
      errors.origin_country = 'Invalid origin country';
    }

    if (!origin_city || typeof origin_city !== 'string' || !origin_city.trim()) {
      errors.origin_city = 'Current origin location is required';
    }

    const weightNum = parseFloat(max_weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      errors.max_weight = 'Max weight must be a positive number in tonnes';
    }

    if (!BODY_TYPES.find(b => b.id === body_type)) {
      errors.body_type = 'Please select a valid body type';
    }

    const contactPhone = phone || req.user.phone;
    if (!contactPhone || typeof contactPhone !== 'string' || !contactPhone.trim()) {
      errors.phone = 'Contact phone number is required';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'validation_failed', errors });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO transports (
        id, user_id,
        origin_country, origin_city,
        destination_country, destination_city,
        body_type, truck_model,
        max_weight, volume,
        available_date, price_expectation,
        phone, notes,
        status, created_at, updated_at
      ) VALUES (
        $1, $2,
        $3, $4,
        $5, $6,
        $7, $8,
        $9, $10,
        $11, $12,
        $13, $14,
        'active', $15, $16
      )
    `, [
      id,
      req.user.id,
      origin_country,
      origin_city.trim(),
      destination_country ? destination_country.trim() : null,
      destination_city ? destination_city.trim() : null,
      body_type,
      truck_model ? truck_model.trim() : null,
      weightNum,
      volume !== undefined && volume !== '' ? parseFloat(volume) : null,
      available_date ? available_date.trim() : null,
      price_expectation ? price_expectation.trim() : null,
      contactPhone.trim(),
      notes ? notes.trim() : null,
      now,
      now
    ]);

    const created = await db.queryOne('SELECT * FROM transports WHERE id = $1', [id]);

    res.status(201).json({
      message: 'Transport listing published successfully',
      transport: created
    });
  } catch (err) {
    console.error('Error creating transport listing:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to publish transport listing' });
  }
});

// Update or toggle status of transport listing (Owner only)
transportRouter.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.queryOne('SELECT * FROM transports WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'not_found', message: 'Transport not found' });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'forbidden', message: 'You do not have permission to modify this transport' });
    }

    const {
      origin_country = existing.origin_country,
      origin_city = existing.origin_city,
      destination_country = existing.destination_country,
      destination_city = existing.destination_city,
      body_type = existing.body_type,
      truck_model = existing.truck_model,
      max_weight = existing.max_weight,
      volume = existing.volume,
      available_date = existing.available_date,
      price_expectation = existing.price_expectation,
      phone = existing.phone,
      notes = existing.notes,
      status = existing.status
    } = req.body;

    if (status && !['active', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'invalid_status', message: 'Status must be active or closed' });
    }

    const weightNum = parseFloat(max_weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return res.status(400).json({ error: 'invalid_weight', message: 'Max weight must be a positive number' });
    }

    const now = new Date().toISOString();

    await db.query(`
      UPDATE transports SET
        origin_country = $1,
        origin_city = $2,
        destination_country = $3,
        destination_city = $4,
        body_type = $5,
        truck_model = $6,
        max_weight = $7,
        volume = $8,
        available_date = $9,
        price_expectation = $10,
        phone = $11,
        notes = $12,
        status = $13,
        updated_at = $14
      WHERE id = $15 AND user_id = $16
    `, [
      origin_country,
      origin_city,
      destination_country,
      destination_city,
      body_type,
      truck_model,
      weightNum,
      volume !== null && volume !== '' ? parseFloat(volume) : null,
      available_date,
      price_expectation,
      phone,
      notes,
      status,
      now,
      id,
      req.user.id
    ]);

    const updated = await db.queryOne('SELECT * FROM transports WHERE id = $1', [id]);
    res.json({
      message: 'Transport listing updated successfully',
      transport: updated
    });
  } catch (err) {
    console.error('Error updating transport:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update transport' });
  }
});

// Delete transport listing (Owner only)
transportRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.queryOne('SELECT * FROM transports WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'not_found', message: 'Transport not found' });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'forbidden', message: 'You do not have permission to delete this transport' });
    }

    await db.query('DELETE FROM transports WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    res.json({
      success: true,
      message: 'Transport listing deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting transport:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to delete transport' });
  }
});
