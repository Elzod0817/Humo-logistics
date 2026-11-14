import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireProfileComplete } from '../auth.js';
import { BODY_TYPES, isValidLocality, getCountry } from '../locations.js';
import { processListingPhones, canViewPhone, maskPhone } from './subscriptionRoutes.js';

export const listingRouter = Router();

// Public cargo search: only active listings, NO phone numbers included
listingRouter.get('/', async (req, res) => {
  try {
    const {
      origin_country,
      origin_locality,
      destination_country,
      destination_locality,
      body_type,
      sort
    } = req.query;

    let query = `
      SELECT 
        l.id,
        l.user_id,
        l.origin_country,
        l.origin_locality,
        l.origin_custom,
        l.destination_country,
        l.destination_locality,
        l.destination_custom,
        l.cargo_name,
        l.cargo_description,
        l.weight,
        l.volume,
        l.dim_length,
        l.dim_width,
        l.dim_height,
        l.body_type,
        l.loading_date_type,
        l.loading_date,
        l.price_type,
        l.price_amount,
        l.price_currency,
        l.status,
        l.created_at,
        u.role as owner_role,
        u.is_verified as owner_verified,
        u.phone as phone
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'active'
    `;

    const params = [];

    if (origin_country) {
      params.push(origin_country);
      query += ` AND l.origin_country = $${params.length}`;
    }
    if (origin_locality) {
      params.push(origin_locality);
      query += ` AND l.origin_locality = $${params.length}`;
    }
    if (destination_country) {
      params.push(destination_country);
      query += ` AND l.destination_country = $${params.length}`;
    }
    if (destination_locality) {
      params.push(destination_locality);
      query += ` AND l.destination_locality = $${params.length}`;
    }
    if (body_type) {
      params.push(body_type);
      query += ` AND l.body_type = $${params.length}`;
    }

    // Sorting
    if (sort === 'weight_asc') {
      query += ' ORDER BY l.weight ASC, l.created_at DESC';
    } else if (sort === 'weight_desc') {
      query += ' ORDER BY l.weight DESC, l.created_at DESC';
    } else {
      query += ' ORDER BY l.created_at DESC';
    }

    const rawListings = await db.queryAll(query, params);
    const listings = await processListingPhones(rawListings, req.user, 'cargo');
    res.json({ listings });
  } catch (err) {
    console.error('Error fetching public listings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to search listings' });
  }
});

// My Listings: returns all listings (active & closed) belonging to the authenticated user
listingRouter.get('/my', requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM listings
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const listings = await db.queryAll(query, [req.user.id]);
    res.json({ listings });
  } catch (err) {
    console.error('Error fetching user listings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch your listings' });
  }
});

// Detail view: returns listing details. NEVER leaks owner phone number!
listingRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        l.id,
        l.user_id,
        l.origin_country,
        l.origin_locality,
        l.origin_custom,
        l.destination_country,
        l.destination_locality,
        l.destination_custom,
        l.cargo_name,
        l.cargo_description,
        l.weight,
        l.volume,
        l.dim_length,
        l.dim_width,
        l.dim_height,
        l.body_type,
        l.loading_date_type,
        l.loading_date,
        l.price_type,
        l.price_amount,
        l.price_currency,
        l.status,
        l.created_at,
        l.updated_at,
        u.role as owner_role,
        u.is_verified as owner_verified,
        u.phone as phone
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `;

    const listing = await db.queryOne(query, [id]);

    if (!listing) {
      return res.status(404).json({ error: 'not_found', message: 'Cargo listing not found' });
    }

    const isOwner = req.user ? req.user.id === listing.user_id : false;
    const isUnlocked = await canViewPhone(req.user, 'cargo', listing.id, listing.user_id);

    res.json({
      listing: {
        ...listing,
        phone: isUnlocked ? listing.phone : maskPhone(listing.phone),
        is_phone_unlocked: isUnlocked,
        is_owner: isOwner
      }
    });
  } catch (err) {
    console.error('Error fetching listing details:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch listing' });
  }
});

function validateListingPayload(body) {
  const errors = {};

  const {
    origin_country,
    origin_locality,
    origin_custom = 0,
    destination_country,
    destination_locality,
    destination_custom = 0,
    cargo_name,
    weight,
    body_type,
    loading_date_type,
    loading_date,
    price_type,
    price_amount
  } = body;

  const originC = getCountry(origin_country);
  if (!originC) {
    errors.origin_country = 'Invalid origin country';
  } else if (!origin_locality || typeof origin_locality !== 'string' || !origin_locality.trim()) {
    errors.origin_locality = 'Origin locality is required';
  } else if (!origin_custom && !isValidLocality(origin_country, origin_locality)) {
    errors.origin_locality = 'Please select a valid origin locality or use custom locality';
  }

  const destC = getCountry(destination_country);
  if (!destC) {
    errors.destination_country = 'Invalid destination country';
  } else if (!destination_locality || typeof destination_locality !== 'string' || !destination_locality.trim()) {
    errors.destination_locality = 'Destination locality is required';
  } else if (!destination_custom && !isValidLocality(destination_country, destination_locality)) {
    errors.destination_locality = 'Please select a valid destination locality or use custom locality';
  }

  if (!cargo_name || typeof cargo_name !== 'string' || cargo_name.trim().length < 2) {
    errors.cargo_name = 'Cargo name must be at least 2 characters';
  }

  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    errors.weight = 'Weight must be a positive number in tonnes';
  }

  const validBody = BODY_TYPES.find(b => b.id === body_type);
  if (!validBody) {
    errors.body_type = 'Please select a valid vehicle body type';
  }

  if (!['ready_now', 'specific'].includes(loading_date_type)) {
    errors.loading_date_type = 'Invalid loading date type';
  } else if (loading_date_type === 'specific') {
    if (!loading_date || isNaN(Date.parse(loading_date))) {
      errors.loading_date = 'Please provide a valid loading date';
    }
  }

  if (!['negotiable', 'fixed'].includes(price_type)) {
    errors.price_type = 'Invalid price type';
  } else if (price_type === 'fixed') {
    const priceNum = parseFloat(price_amount);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price_amount = 'Fixed price amount must be greater than zero';
    }
  }

  return errors;
}

// Publish new cargo listing (Requires completed profile)
listingRouter.post('/', requireAuth, requireProfileComplete, async (req, res) => {
  try {
    const errors = validateListingPayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'validation_failed', errors });
    }

    const {
      origin_country,
      origin_locality,
      origin_custom = 0,
      destination_country,
      destination_locality,
      destination_custom = 0,
      cargo_name,
      cargo_description,
      weight,
      volume,
      dim_length,
      dim_width,
      dim_height,
      body_type,
      loading_date_type,
      loading_date,
      price_type,
      price_amount,
      price_currency
    } = req.body;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO listings (
        id, user_id,
        origin_country, origin_locality, origin_custom,
        destination_country, destination_locality, destination_custom,
        cargo_name, cargo_description,
        weight, volume, dim_length, dim_width, dim_height,
        body_type, loading_date_type, loading_date,
        price_type, price_amount, price_currency,
        status, created_at, updated_at
      ) VALUES (
        $1, $2,
        $3, $4, $5,
        $6, $7, $8,
        $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18,
        $19, $20, $21,
        'active', $22, $23
      )
    `, [
      id,
      req.user.id,
      origin_country,
      origin_locality.trim(),
      origin_custom ? 1 : 0,
      destination_country,
      destination_locality.trim(),
      destination_custom ? 1 : 0,
      cargo_name.trim(),
      cargo_description ? cargo_description.trim() : null,
      parseFloat(weight),
      volume !== undefined && volume !== '' ? parseFloat(volume) : null,
      dim_length !== undefined && dim_length !== '' ? parseFloat(dim_length) : null,
      dim_width !== undefined && dim_width !== '' ? parseFloat(dim_width) : null,
      dim_height !== undefined && dim_height !== '' ? parseFloat(dim_height) : null,
      body_type,
      loading_date_type,
      loading_date_type === 'specific' ? loading_date : null,
      price_type,
      price_type === 'fixed' ? parseFloat(price_amount) : null,
      price_currency || 'UZS',
      now,
      now
    ]);

    const createdListing = await db.queryOne('SELECT * FROM listings WHERE id = $1', [id]);

    res.status(201).json({
      message: 'Listing published successfully',
      listing: createdListing
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to create listing' });
  }
});

// Update listing: enforce ownership on backend!
listingRouter.put('/:id', requireAuth, requireProfileComplete, async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await db.queryOne('SELECT * FROM listings WHERE id = $1', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'not_found', message: 'Listing not found' });
    }

    // Backend ownership check: reject unauthorized edits!
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'forbidden', message: 'You do not have permission to edit this listing' });
    }

    const errors = validateListingPayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'validation_failed', errors });
    }

    const {
      origin_country,
      origin_locality,
      origin_custom = 0,
      destination_country,
      destination_locality,
      destination_custom = 0,
      cargo_name,
      cargo_description,
      weight,
      volume,
      dim_length,
      dim_width,
      dim_height,
      body_type,
      loading_date_type,
      loading_date,
      price_type,
      price_amount,
      price_currency
    } = req.body;

    const now = new Date().toISOString();

    await db.query(`
      UPDATE listings SET
        origin_country = $1,
        origin_locality = $2,
        origin_custom = $3,
        destination_country = $4,
        destination_locality = $5,
        destination_custom = $6,
        cargo_name = $7,
        cargo_description = $8,
        weight = $9,
        volume = $10,
        dim_length = $11,
        dim_width = $12,
        dim_height = $13,
        body_type = $14,
        loading_date_type = $15,
        loading_date = $16,
        price_type = $17,
        price_amount = $18,
        price_currency = $19,
        updated_at = $20
      WHERE id = $21 AND user_id = $22
    `, [
      origin_country,
      origin_locality.trim(),
      origin_custom ? 1 : 0,
      destination_country,
      destination_locality.trim(),
      destination_custom ? 1 : 0,
      cargo_name.trim(),
      cargo_description ? cargo_description.trim() : null,
      parseFloat(weight),
      volume !== undefined && volume !== '' ? parseFloat(volume) : null,
      dim_length !== undefined && dim_length !== '' ? parseFloat(dim_length) : null,
      dim_width !== undefined && dim_width !== '' ? parseFloat(dim_width) : null,
      dim_height !== undefined && dim_height !== '' ? parseFloat(dim_height) : null,
      body_type,
      loading_date_type,
      loading_date_type === 'specific' ? loading_date : null,
      price_type,
      price_type === 'fixed' ? parseFloat(price_amount) : null,
      price_currency || 'UZS',
      now,
      id,
      req.user.id
    ]);

    const updatedListing = await db.queryOne('SELECT * FROM listings WHERE id = $1', [id]);

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update listing' });
  }
});

// Close or reactivate listing: enforce ownership on backend!
const updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'invalid_status', message: 'Status must be active or closed' });
    }

    const listing = await db.queryOne('SELECT * FROM listings WHERE id = $1', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'not_found', message: 'Listing not found' });
    }

    // Reject unauthorized edits
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'forbidden', message: 'You do not have permission to alter this listing' });
    }

    const now = new Date().toISOString();
    await db.query('UPDATE listings SET status = $1, updated_at = $2 WHERE id = $3 AND user_id = $4', [status, now, id, req.user.id]);

    const updatedListing = await db.queryOne('SELECT * FROM listings WHERE id = $1', [id]);

    res.json({
      message: status === 'closed' ? 'Listing closed successfully' : 'Listing reactivated successfully',
      listing: updatedListing
    });
  } catch (err) {
    console.error('Error updating listing status:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to update listing status' });
  }
};

listingRouter.post('/:id/status', requireAuth, updateListingStatus);
listingRouter.patch('/:id/status', requireAuth, updateListingStatus);
