-- ====================================================================
-- Humo Logistics — Supabase Migration: 002_roles_and_phone_reveal.sql
-- Bosqich 2: Rol almashtirish (Role Switcher) va Telefon raqam himoyasi (Phone Masking & Reveal)
-- ====================================================================

-- 1. USERS JADVALIGA ROLLR VA VERIFIKATSIYA USTUNLARINI QO'SHISH
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_role VARCHAR(20) DEFAULT 'driver' CHECK (active_role IN ('driver', 'shipper', 'dispatcher'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS available_roles TEXT[] DEFAULT ARRAY['driver', 'shipper', 'dispatcher'];
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. LOADS (YUKLAR) JADVALINI YARATISH (agar mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  cargo_type VARCHAR(100),
  weight_tons NUMERIC(10, 2),
  volume_m3 NUMERIC(10, 2),
  origin_city VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  pickup_date DATE,
  delivery_date DATE,
  price NUMERIC(15, 2),
  currency VARCHAR(10) DEFAULT 'UZS',
  phone VARCHAR(30),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE loads ADD COLUMN IF NOT EXISTS cargo_type VARCHAR(100);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS weight_tons NUMERIC(10, 2);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS volume_m3 NUMERIC(10, 2);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS origin_city VARCHAR(100);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS price NUMERIC(15, 2);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'UZS';
ALTER TABLE loads ADD COLUMN IF NOT EXISTS pickup_date DATE;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. CONTACT_REVEALS (OCHILGAN KONTAKTLAR) JADVALINI YARATISH
CREATE TABLE IF NOT EXISTS contact_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES loads(id) ON DELETE CASCADE,
  viewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  revealed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(load_id, viewer_id)
);

-- 4. INDEKSLAR (Anti-scraping va tezkor qidiruv uchun)
CREATE INDEX IF NOT EXISTS idx_contact_reveals_viewer_revealed 
  ON contact_reveals (viewer_id, revealed_at DESC);

CREATE INDEX IF NOT EXISTS idx_loads_status_created 
  ON loads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loads_owner 
  ON loads (owner_id);
