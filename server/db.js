import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/humo.db');

export const isPg = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

export let pool = null;
export let sqliteDb = null;

if (isPg) {
  console.log('Initializing Supabase PostgreSQL connection pool...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log('DATABASE_URL not provided. Initializing local SQLite fallback at', dbPath);
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
}

// Convert PostgreSQL $1, $2 query into SQLite ? placeholders
function convertPgToSqlite(sql, params = []) {
  if (!params || params.length === 0) {
    return { sql, params: [] };
  }
  if (!sql.includes('$')) {
    const mapped = params.map(p => (p === true ? 1 : p === false ? 0 : p));
    return { sql, params: mapped };
  }
  const reorderedParams = [];
  const convertedSql = sql.replace(/\$(\d+)/g, (_, num) => {
    const idx = parseInt(num, 10) - 1;
    let val = params[idx];
    if (val === true) val = 1;
    else if (val === false) val = 0;
    reorderedParams.push(val);
    return '?';
  });
  return { sql: convertedSql, params: reorderedParams };
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2 if needed
function convertSqliteToPg(sql) {
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
}

export const db = {
  isPg,
  pool,
  sqlite: sqliteDb,

  async query(sql, params = []) {
    if (isPg) {
      const pgSql = sql.includes('?') && !sql.includes('$') ? convertSqliteToPg(sql) : sql;
      const res = await pool.query(pgSql, params);
      return { rows: res.rows, rowCount: res.rowCount };
    } else {
      const { sql: sqliteSql, params: sqliteParams } = convertPgToSqlite(sql, params);
      const trimmed = sqliteSql.trim().toUpperCase();
      const isSelect = trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA');
      const stmt = sqliteDb.prepare(sqliteSql);
      if (isSelect) {
        const rows = stmt.all(...sqliteParams);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...sqliteParams);
        return { rows: [], rowCount: info.changes };
      }
    }
  },

  async queryOne(sql, params = []) {
    const res = await this.query(sql, params);
    return res.rows[0] || null;
  },

  async queryAll(sql, params = []) {
    const res = await this.query(sql, params);
    return res.rows;
  },

  async execute(sql, params = []) {
    const res = await this.query(sql, params);
    return { rowCount: res.rowCount };
  },

  // Backwards-compatibility helper for any legacy synchronous calls in SQLite mode
  prepare(sql) {
    if (isPg) {
      throw new Error('db.prepare is not available in PostgreSQL mode. Please use await db.query(sql, params).');
    }
    const { sql: sqliteSql } = convertPgToSqlite(sql, []);
    return sqliteDb.prepare(sqliteSql);
  },

  exec(sql) {
    if (isPg) {
      return pool.query(sql);
    } else {
      return sqliteDb.exec(sql);
    }
  }
};

export async function initDatabase() {
  if (isPg) {
    console.log('Verifying & migrating Supabase PostgreSQL tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        profile_completed INTEGER NOT NULL DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        is_banned BOOLEAN DEFAULT FALSE,
        free_contacts_remaining INTEGER NOT NULL DEFAULT 117,
        plan_id INTEGER,
        plan_expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        origin_country TEXT NOT NULL,
        origin_locality TEXT NOT NULL,
        origin_custom INTEGER NOT NULL DEFAULT 0,
        destination_country TEXT NOT NULL,
        destination_locality TEXT NOT NULL,
        destination_custom INTEGER NOT NULL DEFAULT 0,
        cargo_name TEXT NOT NULL,
        cargo_description TEXT,
        weight REAL NOT NULL,
        volume REAL,
        dim_length REAL,
        dim_width REAL,
        dim_height REAL,
        body_type TEXT NOT NULL,
        loading_date_type TEXT NOT NULL DEFAULT 'ready_now',
        loading_date TEXT,
        price_type TEXT NOT NULL DEFAULT 'negotiable',
        price_amount REAL,
        price_currency TEXT NOT NULL DEFAULT 'UZS',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        origin_country TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        destination_country TEXT,
        destination_city TEXT,
        body_type TEXT NOT NULL,
        truck_model TEXT,
        max_weight REAL NOT NULL,
        volume REAL,
        available_date TEXT,
        price_expectation TEXT,
        phone TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        listing_type TEXT NOT NULL,
        listing_id TEXT NOT NULL,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message TEXT,
        last_message_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        offered_price REAL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name_uz TEXT NOT NULL,
        name_ru TEXT NOT NULL,
        name_en TEXT NOT NULL,
        description_uz TEXT,
        description_ru TEXT,
        description_en TEXT,
        price_uzs INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        contact_limit INTEGER NOT NULL,
        is_popular BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS unlocked_contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_type TEXT NOT NULL,
        listing_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, listing_type, listing_id)
      );

      CREATE TABLE IF NOT EXISTS subscription_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
        receipt_note TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS payment_settings (
        id INTEGER PRIMARY KEY,
        card_number TEXT NOT NULL,
        card_holder TEXT NOT NULL,
        card_bank TEXT,
        instructions_uz TEXT,
        instructions_ru TEXT,
        instructions_en TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS support_settings (
        id INTEGER PRIMARY KEY,
        phone TEXT NOT NULL DEFAULT '+998 71 200 00 00',
        email TEXT NOT NULL DEFAULT 'support@humologistics.uz',
        telegram_support TEXT NOT NULL DEFAULT 'https://t.me/humo_support',
        whatsapp_support TEXT NOT NULL DEFAULT 'https://wa.me/998901234567',
        working_hours_uz TEXT NOT NULL DEFAULT 'Dushanba - Shanba: 09:00 - 20:00',
        working_hours_ru TEXT NOT NULL DEFAULT 'Понедельник - Суббота: 09:00 - 20:00',
        working_hours_en TEXT NOT NULL DEFAULT 'Monday - Saturday: 09:00 - 20:00',
        address_uz TEXT NOT NULL DEFAULT 'Toshkent sh., Amir Temur shox ko‘chasi, 107-B',
        address_ru TEXT NOT NULL DEFAULT 'г. Ташкент, пр. Амира Темура, 107-Б',
        address_en TEXT NOT NULL DEFAULT 'Tashkent, Amir Temur Ave, 107-B',
        is_widget_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        is_address_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'group',
        icon TEXT DEFAULT 'Users',
        is_pinned BOOLEAN DEFAULT FALSE,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS channel_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cargo_companies (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'international',
        origin_regions TEXT NOT NULL DEFAULT '[]',
        destination_regions TEXT NOT NULL DEFAULT '[]',
        delivery_modes TEXT NOT NULL DEFAULT '[]',
        price_per_kg_usd REAL,
        price_per_kg_uzs REAL,
        min_weight_kg REAL NOT NULL DEFAULT 1,
        delivery_days TEXT NOT NULL DEFAULT '12-16 kun',
        services TEXT NOT NULL DEFAULT '[]',
        phone TEXT NOT NULL,
        address TEXT,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        rating REAL NOT NULL DEFAULT 4.8,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otp_codes (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'forgot_password',
        attempts INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transports_status_created ON transports(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transports_user ON transports(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_type, listing_id);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_unlocked_contacts_lookup ON unlocked_contacts(user_id, listing_type, listing_id);
      CREATE INDEX IF NOT EXISTS idx_sub_requests_status ON subscription_requests(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_listings_search ON listings(origin_country, destination_country, body_type, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transports_search ON transports(origin_country, destination_country, body_type, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_channels_pinned_created ON channels(is_pinned DESC, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_channel_messages_channel ON channel_messages(channel_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_cargo_companies_cat_ver ON cargo_companies(category, is_verified, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_lookup ON otp_codes(identifier, code, expires_at);

      ALTER TABLE users ADD COLUMN IF NOT EXISTS free_contacts_remaining INTEGER NOT NULL DEFAULT 117;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
      ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('Supabase PostgreSQL database initialized successfully.');
  } else {
    console.log('Verifying & migrating SQLite tables...');
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        profile_completed INTEGER NOT NULL DEFAULT 0,
        is_verified INTEGER NOT NULL DEFAULT 0,
        is_banned INTEGER NOT NULL DEFAULT 0,
        free_contacts_remaining INTEGER NOT NULL DEFAULT 117,
        plan_id INTEGER,
        plan_expires_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        origin_country TEXT NOT NULL,
        origin_locality TEXT NOT NULL,
        origin_custom INTEGER NOT NULL DEFAULT 0,
        destination_country TEXT NOT NULL,
        destination_locality TEXT NOT NULL,
        destination_custom INTEGER NOT NULL DEFAULT 0,
        cargo_name TEXT NOT NULL,
        cargo_description TEXT,
        weight REAL NOT NULL,
        volume REAL,
        dim_length REAL,
        dim_width REAL,
        dim_height REAL,
        body_type TEXT NOT NULL,
        loading_date_type TEXT NOT NULL DEFAULT 'ready_now',
        loading_date TEXT,
        price_type TEXT NOT NULL DEFAULT 'negotiable',
        price_amount REAL,
        price_currency TEXT NOT NULL DEFAULT 'UZS',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        origin_country TEXT NOT NULL,
        origin_city TEXT NOT NULL,
        destination_country TEXT,
        destination_city TEXT,
        body_type TEXT NOT NULL,
        truck_model TEXT,
        max_weight REAL NOT NULL,
        volume REAL,
        available_date TEXT,
        price_expectation TEXT,
        phone TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        listing_type TEXT NOT NULL,
        listing_id TEXT NOT NULL,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message TEXT,
        last_message_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        offered_price REAL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_uz TEXT NOT NULL,
        name_ru TEXT NOT NULL,
        name_en TEXT NOT NULL,
        description_uz TEXT,
        description_ru TEXT,
        description_en TEXT,
        price_uzs INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        contact_limit INTEGER NOT NULL,
        is_popular INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS unlocked_contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_type TEXT NOT NULL,
        listing_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, listing_type, listing_id)
      );

      CREATE TABLE IF NOT EXISTS subscription_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
        receipt_note TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS payment_settings (
        id INTEGER PRIMARY KEY,
        card_number TEXT NOT NULL,
        card_holder TEXT NOT NULL,
        card_bank TEXT,
        instructions_uz TEXT,
        instructions_ru TEXT,
        instructions_en TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS support_settings (
        id INTEGER PRIMARY KEY,
        phone TEXT NOT NULL DEFAULT '+998 71 200 00 00',
        email TEXT NOT NULL DEFAULT 'support@humologistics.uz',
        telegram_support TEXT NOT NULL DEFAULT 'https://t.me/humo_support',
        whatsapp_support TEXT NOT NULL DEFAULT 'https://wa.me/998901234567',
        working_hours_uz TEXT NOT NULL DEFAULT 'Dushanba - Shanba: 09:00 - 20:00',
        working_hours_ru TEXT NOT NULL DEFAULT 'Понедельник - Суббота: 09:00 - 20:00',
        working_hours_en TEXT NOT NULL DEFAULT 'Monday - Saturday: 09:00 - 20:00',
        address_uz TEXT NOT NULL DEFAULT 'Toshkent sh., Amir Temur shox ko‘chasi, 107-B',
        address_ru TEXT NOT NULL DEFAULT 'г. Ташкент, пр. Амира Темура, 107-Б',
        address_en TEXT NOT NULL DEFAULT 'Tashkent, Amir Temur Ave, 107-B',
        is_widget_enabled INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS social_links (
        id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'group',
        icon TEXT DEFAULT 'Users',
        is_pinned INTEGER NOT NULL DEFAULT 0,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS channel_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cargo_companies (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'international',
        origin_regions TEXT NOT NULL DEFAULT '[]',
        destination_regions TEXT NOT NULL DEFAULT '[]',
        delivery_modes TEXT NOT NULL DEFAULT '[]',
        price_per_kg_usd REAL,
        price_per_kg_uzs REAL,
        min_weight_kg REAL NOT NULL DEFAULT 1,
        delivery_days TEXT NOT NULL DEFAULT '12-16 kun',
        services TEXT NOT NULL DEFAULT '[]',
        phone TEXT NOT NULL,
        address TEXT,
        is_verified INTEGER NOT NULL DEFAULT 0,
        rating REAL NOT NULL DEFAULT 4.8,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS otp_codes (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'forgot_password',
        attempts INTEGER NOT NULL DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transports_status_created ON transports(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transports_user ON transports(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_type, listing_id);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_unlocked_contacts_lookup ON unlocked_contacts(user_id, listing_type, listing_id);
      CREATE INDEX IF NOT EXISTS idx_sub_requests_status ON subscription_requests(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_listings_search ON listings(origin_country, destination_country, body_type, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_transports_search ON transports(origin_country, destination_country, body_type, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_channels_pinned_created ON channels(is_pinned DESC, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_channel_messages_channel ON channel_messages(channel_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_cargo_companies_cat_ver ON cargo_companies(category, is_verified, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_lookup ON otp_codes(identifier, code, expires_at);
    `);

    // Run safe migrations for existing SQLite databases
    try {
      const tableInfo = sqliteDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
      if (tableInfo && tableInfo.sql && tableInfo.sql.includes("CHECK")) {
        sqliteDb.exec(`
          PRAGMA foreign_keys = OFF;
          CREATE TABLE IF NOT EXISTS users_migrated (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'user',
            profile_completed INTEGER NOT NULL DEFAULT 0,
            is_verified INTEGER NOT NULL DEFAULT 0,
            is_banned INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          INSERT OR IGNORE INTO users_migrated (id, email, password_hash, first_name, last_name, phone, role, profile_completed, created_at, updated_at)
          SELECT id, email, password_hash, first_name, last_name, phone, role, profile_completed, created_at, updated_at FROM users;
          DROP TABLE users;
          ALTER TABLE users_migrated RENAME TO users;
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          PRAGMA foreign_keys = ON;
        `);
        console.log('Migrated users table to support admin, dispatcher, driver, cargo_owner, and user roles.');
      }
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }

    try {
      sqliteDb.exec('ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0;');
    } catch (e) { /* Column already exists */ }
    try {
      sqliteDb.exec('ALTER TABLE users ADD COLUMN is_banned INTEGER NOT NULL DEFAULT 0;');
    } catch (e) { /* Column already exists */ }
    try {
      sqliteDb.exec('ALTER TABLE users ADD COLUMN free_contacts_remaining INTEGER NOT NULL DEFAULT 117;');
    } catch (e) { /* Column already exists */ }
    try {
      sqliteDb.exec('ALTER TABLE users ADD COLUMN plan_id INTEGER;');
    } catch (e) { /* Column already exists */ }
    try {
      sqliteDb.exec('ALTER TABLE users ADD COLUMN plan_expires_at TEXT;');
    } catch (e) { /* Column already exists */ }
    try {
      sqliteDb.exec('UPDATE users SET free_contacts_remaining = 117 WHERE free_contacts_remaining IS NULL;');
    } catch (e) { }
    try {
      sqliteDb.exec('ALTER TABLE otp_codes ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;');
    } catch (e) { /* Column already exists */ }
    try {
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS payment_settings (
          id INTEGER PRIMARY KEY,
          card_number TEXT NOT NULL,
          card_holder TEXT NOT NULL,
          card_bank TEXT,
          instructions_uz TEXT,
          instructions_ru TEXT,
          instructions_en TEXT,
          updated_at TEXT
        );
      `);
    } catch (e) { }

    try {
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS support_settings (
          id INTEGER PRIMARY KEY,
          phone TEXT NOT NULL DEFAULT '+998 71 200 00 00',
          email TEXT NOT NULL DEFAULT 'support@humologistics.uz',
          telegram_support TEXT NOT NULL DEFAULT 'https://t.me/humo_support',
          whatsapp_support TEXT NOT NULL DEFAULT 'https://wa.me/998901234567',
          working_hours_uz TEXT NOT NULL DEFAULT 'Dushanba - Shanba: 09:00 - 20:00',
          working_hours_ru TEXT NOT NULL DEFAULT 'Понедельник - Суббота: 09:00 - 20:00',
          working_hours_en TEXT NOT NULL DEFAULT 'Monday - Saturday: 09:00 - 20:00',
          address_uz TEXT NOT NULL DEFAULT 'Toshkent sh., Amir Temur shox ko‘chasi, 107-B',
          address_ru TEXT NOT NULL DEFAULT 'г. Ташкент, пр. Амира Темура, 107-Б',
          address_en TEXT NOT NULL DEFAULT 'Tashkent, Amir Temur Ave, 107-B',
          is_widget_enabled INTEGER NOT NULL DEFAULT 1,
          is_address_enabled INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT
        );
      `);
    } catch (e) { }

    try {
      sqliteDb.exec(`ALTER TABLE support_settings ADD COLUMN is_address_enabled INTEGER DEFAULT 1;`);
    } catch (e) { }

    try {
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS social_links (
          id TEXT PRIMARY KEY,
          platform TEXT NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);
    } catch (e) { }

    console.log('Local SQLite database initialized successfully at', dbPath);
  }
}

export async function seedDefaultPlans() {
  try {
    const now = new Date().toISOString();
    const defaultPlans = [
      {
        name_uz: "Start (Boshlang'ich)",
        name_ru: "Старт (Начальный)",
        name_en: "Start (Free)",
        description_uz: "117 ta bepul kontaktlarni ko'rish, standart yuk va transport e'lonlari, chat orqali narx kelishish",
        description_ru: "117 бесплатных контактов, стандартные объявления грузов и транспорта, переговоры в чате",
        description_en: "117 free contact unlocks, standard cargo & truck listings, direct chat negotiations",
        price_uzs: 0,
        duration_days: 365,
        contact_limit: 117,
        is_popular: false,
        is_active: true
      },
      {
        name_uz: "Pro Dispetcher",
        name_ru: "Про Диспетчер",
        name_en: "Pro Dispatcher",
        description_uz: "Cheksiz kontaktlarni ko'rish, 'Tasdiqlangan' verifikatsiya nishoni va haydovchilar bilan tezkor aloqa",
        description_ru: "Неограниченные контакты, бейдж 'Верифицирован' и прямая связь с перевозчиками",
        description_en: "Unlimited contact reveals, 'Verified' partner badge and instant direct telephone access",
        price_uzs: 149000,
        duration_days: 30,
        contact_limit: -1,
        is_popular: true,
        is_active: true
      },
      {
        name_uz: "Biznes / Kompaniya",
        name_ru: "Бизнес / Автопарк",
        name_en: "Business / Fleet",
        description_uz: "Cheksiz kontaktlar, e'lonlarning ustuvor ko'rinishi, avtopark boshqaruvi va shaxsiy menejer yordami",
        description_ru: "Безлимитные контакты, приоритет в выдаче, управление автопарком и персональный менеджер",
        description_en: "Unlimited contacts, priority top placement, fleet management and dedicated account manager",
        price_uzs: 349000,
        duration_days: 30,
        contact_limit: -1,
        is_popular: false,
        is_active: true
      }
    ];

    for (const p of defaultPlans) {
      const existing = await db.queryOne('SELECT id FROM subscription_plans WHERE name_uz = $1', [p.name_uz]);
      if (!existing) {
        await db.query(`
          INSERT INTO subscription_plans (
            name_uz, name_ru, name_en, description_uz, description_ru, description_en,
            price_uzs, duration_days, contact_limit, is_popular, is_active, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          p.name_uz, p.name_ru, p.name_en, p.description_uz, p.description_ru, p.description_en,
          p.price_uzs, p.duration_days, p.contact_limit, p.is_popular, p.is_active, now
        ]);
        console.log(`Seeded plan: ${p.name_uz}`);
      }
    }
    console.log('Seeded default subscription plans successfully.');
  } catch (err) {
    console.error('Error seeding default subscription plans:', err);
  }
}

export async function seedPaymentSettings() {
  try {
    const existing = await db.queryOne('SELECT * FROM payment_settings WHERE id = 1');
    if (!existing) {
      const now = new Date().toISOString();
      await db.query(`
        INSERT INTO payment_settings (
          id, card_number, card_holder, card_bank,
          instructions_uz, instructions_ru, instructions_en, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7
        )
      `, [
        '9860 0301 4455 8899',
        'Humo Logistics MCHJ',
        'Humo / Uzcard',
        'Click, Payme yoki bank ilovasi orqali to‘lov qiling va quyida chek raqami yoki to‘lovchi ismini qoldiring.',
        'Оплатите через Click, Payme или банковское приложение и укажите номер чека или имя плательщика ниже.',
        'Pay via Click, Payme or banking app and enter your payment receipt number or sender name below.',
        now
      ]);
      console.log('Default payment settings seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding payment settings:', err);
  }
}

export async function seedSupportAndSocials() {
  try {
    const existingSupport = await db.queryOne('SELECT * FROM support_settings WHERE id = 1');
    const now = new Date().toISOString();
    if (!existingSupport) {
      await db.query(`
        INSERT INTO support_settings (
          id, phone, email, telegram_support, whatsapp_support,
          working_hours_uz, working_hours_ru, working_hours_en,
          address_uz, address_ru, address_en,
          is_widget_enabled, is_address_enabled, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `, [
        '+998 71 200 00 00',
        'support@humologistics.uz',
        'https://t.me/humo_support',
        'https://wa.me/998901234567',
        'Dushanba - Shanba: 09:00 - 20:00',
        'Понедельник - Суббота: 09:00 - 20:00',
        'Monday - Saturday: 09:00 - 20:00',
        'Toshkent sh., Amir Temur shox ko‘chasi, 107-B',
        'г. Ташкент, пр. Амира Темура, 107-Б',
        'Tashkent, Amir Temur Ave, 107-B',
        true,
        true,
        now
      ]);
      console.log('Default support settings seeded successfully.');
    }

    const socialCount = await db.queryOne('SELECT COUNT(*) as cnt FROM social_links');
    if (Number(socialCount?.cnt || 0) === 0) {
      const defaults = [
        { id: crypto.randomUUID(), platform: 'telegram', title: 'Telegram', url: 'https://t.me/humologistics', sort_order: 1 },
        { id: crypto.randomUUID(), platform: 'instagram', title: 'Instagram', url: 'https://instagram.com/humologistics', sort_order: 2 },
        { id: crypto.randomUUID(), platform: 'facebook', title: 'Facebook', url: 'https://facebook.com/humologistics', sort_order: 3 },
        { id: crypto.randomUUID(), platform: 'youtube', title: 'YouTube', url: 'https://youtube.com/@humologistics', sort_order: 4 },
        { id: crypto.randomUUID(), platform: 'whatsapp', title: 'WhatsApp', url: 'https://wa.me/998901234567', sort_order: 5 }
      ];
      for (const s of defaults) {
        await db.query(`
          INSERT INTO social_links (id, platform, title, url, is_active, sort_order, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [s.id, s.platform, s.title, s.url, true, s.sort_order, now]);
      }
      console.log('Default social links seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding support and social links:', err);
  }
}

function hashAdminPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function seedDefaultAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@humologistics.uz').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin12345!';

  try {
    const existing = await db.queryOne('SELECT id, role, is_verified FROM users WHERE email = $1', [adminEmail]);
    if (!existing) {
      const id = crypto.randomUUID();
      const passwordHash = hashAdminPassword(adminPassword);
      const now = new Date().toISOString();
      await db.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, phone, role, 
          profile_completed, is_verified, is_banned, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          1, true, false, $8, $9
        )
      `, [
        id,
        adminEmail,
        passwordHash,
        'System',
        'Administrator',
        '+998900000000',
        'admin',
        now,
        now
      ]);
      console.log(`Default admin account seeded for ${adminEmail} (role = admin, is_verified = true)`);
    } else if (existing.role !== 'admin' || !existing.is_verified) {
      await db.query('UPDATE users SET role = $1, is_verified = true WHERE email = $2', ['admin', adminEmail]);
      console.log(`Updated existing user ${adminEmail} to role = admin, is_verified = true`);
    }

    // Seed Demo Carrier User (+998901234567 / Demo12345!)
    const demoPhone = '+998901234567';
    const demoEmail = 'demo@humologistics.uz';
    const demoExisting = await db.queryOne('SELECT id FROM users WHERE phone = $1 OR email = $2', [demoPhone, demoEmail]);
    if (!demoExisting) {
      const demoId = crypto.randomUUID();
      const demoHash = hashAdminPassword('Demo12345!');
      const now = new Date().toISOString();
      await db.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, phone, role, 
          profile_completed, is_verified, is_banned, free_contacts_remaining, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 
          1, true, false, 117, $8, $9
        )
      `, [demoId, demoEmail, demoHash, 'Sardor', 'Aliyev', demoPhone, 'carrier', now, now]);
      console.log(`Default demo carrier account seeded for ${demoPhone} / ${demoEmail}`);
    }
  } catch (err) {
    console.error('Error seeding default admin:', err);
  }
}

export async function seedDefaultChannels() {
  try {
    const now = new Date().toISOString();
    const defaultChannels = [
      {
        id: 'dispetcherlar-va-yuk-egalari',
        name: 'Dispetcherlar va Yuk egalari',
        description: "Yuk e'lonlari va dispetcherlar umumiy muhokama guruhi",
        type: 'group',
        icon: 'Package',
        is_pinned: isPg ? true : 1,
      },
      {
        id: 'haydovchilar-guruhi',
        name: 'Haydovchilar guruhi',
        description: "Bo'sh mashinalar va haydovchilar rasmiy guruhi",
        type: 'group',
        icon: 'Truck',
        is_pinned: isPg ? true : 1,
      }
    ];

    for (const ch of defaultChannels) {
      const existing = await db.queryOne('SELECT id FROM channels WHERE id = $1', [ch.id]);
      if (!existing) {
        await db.query(
          `INSERT INTO channels (id, name, description, type, icon, is_pinned, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [ch.id, ch.name, ch.description, ch.type, ch.icon, ch.is_pinned, now, now]
        );
        console.log(`Seeded official default channel: ${ch.name}`);
      }
    }

    // Seed initial welcome messages if empty
    const adminUser = await db.queryOne("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminUser) {
      for (const ch of defaultChannels) {
        const msgCount = await db.queryOne('SELECT COUNT(*) as count FROM channel_messages WHERE channel_id = $1', [ch.id]);
        if (Number(msgCount?.count || 0) === 0) {
          const welcomeText = ch.id === 'dispetcherlar-va-yuk-egalari'
            ? "Humo Logistics rasmiy guruhiga xush kelibsiz! Bu yerda yuk egalari va dispetcherlar to'g'ridan-to'g'ri bog'lanib, yangi yuklar va marshrutlar haqida tezkor ma'lumot almashishlari mumkin."
            : "Barcha tashuvchi va haydovchilarimiz uchun rasmiy guruh. Yo'nalishlar, bo'sh mashinalar va tajriba almashish maydoni. Qoidalar: o'zaro hurmat va faqat ishonchli ma'lumotlar.";
          const msgId = crypto.randomUUID();
          await db.query(
            'INSERT INTO channel_messages (id, channel_id, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5)',
            [msgId, ch.id, adminUser.id, welcomeText, now]
          );
        }
      }
    }
  } catch (err) {
    console.error('Error seeding default channels:', err);
  }
}

export async function seedDefaultCargoCompanies() {
  try {
    const existingCount = await db.queryOne('SELECT COUNT(*) as count FROM cargo_companies');
    if (Number(existingCount?.count || 0) > 0) {
      return;
    }

    const now = new Date().toISOString();
    const verifiedValue = isPg ? true : 1;

    const companies = [
      {
        id: 'silk-road-cargo',
        name: 'Silk Road Cargo Express',
        category: 'international',
        origin_regions: JSON.stringify(["Xitoy (Guangzhou, Yiwu, Urumqi)"]),
        destination_regions: JSON.stringify(["O'zbekiston (Barcha viloyatlar)", "Toshkent"]),
        delivery_modes: JSON.stringify(['Avto', 'Avia']),
        price_per_kg_usd: 2.8,
        price_per_kg_uzs: 36000,
        min_weight_kg: 1,
        delivery_days: '12-16 kun',
        services: JSON.stringify([
          "1688/Taobao to'lov va qabul qilish",
          "Bojxona tozalash (Rastamojka)",
          "Ombor xizmati",
          "Eshikkacha yetkazish"
        ]),
        phone: '+998901234567',
        address: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 42",
        is_verified: verifiedValue,
        rating: 4.9,
      },
      {
        id: 'istanbul-express-kargo',
        name: 'Istanbul Express Kargo',
        category: 'international',
        origin_regions: JSON.stringify(["Turkiya (Istanbul, Bursa, Gaziantep)"]),
        destination_regions: JSON.stringify(["O'zbekiston (Toshkent, Samarqand, Farg'ona)"]),
        delivery_modes: JSON.stringify(['Avto', 'Avia']),
        price_per_kg_usd: 3.5,
        price_per_kg_uzs: 45000,
        min_weight_kg: 5,
        delivery_days: '5-8 kun',
        services: JSON.stringify([
          "Laleli va Merterdan yig'ish",
          "Kiyim-kechak va matolar",
          "Sug'urta kafolati",
          "Tezkor avia"
        ]),
        phone: '+998935001122',
        address: "Toshkent sh., Abu Saxiy savdo markazi, 4-blok",
        is_verified: verifiedValue,
        rating: 4.8,
      },
      {
        id: 'dubai-air-cargo',
        name: 'Dubai Air Cargo & Logistics',
        category: 'international',
        origin_regions: JSON.stringify(["BAA (Dubay, Sharja)"]),
        destination_regions: JSON.stringify(["O'zbekiston (Toshkent xalqaro aeroporti)"]),
        delivery_modes: JSON.stringify(['Avia']),
        price_per_kg_usd: 4.2,
        price_per_kg_uzs: 54000,
        min_weight_kg: 1,
        delivery_days: '3-5 kun',
        services: JSON.stringify([
          "Tezkor avia yetkazish",
          "Elektronika va original tovarlar",
          "To'g'ridan-to'g'ri reys",
          "Ombor kafolati"
        ]),
        phone: '+998977708899',
        address: "Toshkent sh., Sergeli tumani, Yangi Sergeli 15",
        is_verified: verifiedValue,
        rating: 4.9,
      },
      {
        id: 'vodiy-express-pochta',
        name: 'Vodiy Express Tezkor Kargo',
        category: 'domestic',
        origin_regions: JSON.stringify(["Toshkent sh."]),
        destination_regions: JSON.stringify(["Andijon", "Farg'ona", "Namangan"]),
        delivery_modes: JSON.stringify(['Avto', 'Kuryer', 'Eshikdan eshikgacha']),
        price_per_kg_usd: null,
        price_per_kg_uzs: 15000,
        min_weight_kg: 1,
        delivery_days: '24 soat',
        services: JSON.stringify([
          "Eshikdan eshikgacha yetkazish",
          "Naqd pul qabul qilish (COD)",
          "Kichik va o'rta posilkalar",
          "Kunlik qatnov"
        ]),
        phone: '+998912223344',
        address: "Toshkent sh., Bektemir tumani, Qo'yliq bozori 7-pavilon",
        is_verified: verifiedValue,
        rating: 4.8,
      },
      {
        id: 'oazis-trans-kargo',
        name: 'Oazis Trans Kargo',
        category: 'domestic',
        origin_regions: JSON.stringify(["Toshkent sh.", "Samarqand"]),
        destination_regions: JSON.stringify(["Buxoro", "Navoiy", "Xorazm (Urganch)", "Qoraqalpog'iston (Nukus)"]),
        delivery_modes: JSON.stringify(['Avto', 'Yuk furalari']),
        price_per_kg_usd: null,
        price_per_kg_uzs: 12000,
        min_weight_kg: 10,
        delivery_days: '24-48 soat',
        services: JSON.stringify([
          "Katta hajmdagi LTL yuklar",
          "Paletali yuk tashish",
          "Viloyat markazlarida omborlar",
          "CMR va hisob-faktura"
        ]),
        phone: '+998993334455',
        address: "Toshkent sh., Uchtepa tumani, O'rikzor savdo majmuasi",
        is_verified: verifiedValue,
        rating: 4.8,
      },
      {
        id: 'janub-express-logistika',
        name: 'Janub Express Logistika',
        category: 'domestic',
        origin_regions: JSON.stringify(["Toshkent sh."]),
        destination_regions: JSON.stringify(["Qashqadaryo (Qarshi, Shahrisabz)", "Surxondaryo (Termiz, Denov)"]),
        delivery_modes: JSON.stringify(['Avto', 'Kuryer']),
        price_per_kg_usd: null,
        price_per_kg_uzs: 14000,
        min_weight_kg: 2,
        delivery_days: '24-36 soat',
        services: JSON.stringify([
          "Har kuni qatnov",
          "Tezkor jo'natma",
          "SMS xabarnoma",
          "Mo'rt yuklarni ehtiyotkor tashish"
        ]),
        phone: '+998946667788',
        address: "Toshkent sh., Yakkasaroy tumani, Janubiy vokzal hududi",
        is_verified: verifiedValue,
        rating: 4.7,
      }
    ];

    for (const c of companies) {
      await db.query(`
        INSERT INTO cargo_companies (
          id, name, category, origin_regions, destination_regions, delivery_modes,
          price_per_kg_usd, price_per_kg_uzs, min_weight_kg, delivery_days,
          services, phone, address, is_verified, rating, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `, [
        c.id, c.name, c.category, c.origin_regions, c.destination_regions, c.delivery_modes,
        c.price_per_kg_usd, c.price_per_kg_uzs, c.min_weight_kg, c.delivery_days,
        c.services, c.phone, c.address, c.is_verified, c.rating, now, now
      ]);
      console.log(`Seeded official cargo company: ${c.name} (${c.category})`);
    }
  } catch (err) {
    console.error('Error seeding default cargo companies:', err);
  }
}

export async function promoteToAdmin(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const existing = await db.queryOne('SELECT id, email, role FROM users WHERE email = $1', [normalizedEmail]);
  if (!existing) {
    throw new Error(`User with email "${normalizedEmail}" not found`);
  }
  await db.query('UPDATE users SET role = $1, is_verified = true WHERE email = $2', ['admin', normalizedEmail]);
  return await db.queryOne('SELECT id, email, role, is_verified FROM users WHERE email = $1', [normalizedEmail]);
}

export async function closeDatabase() {
  if (isPg && pool) {
    try {
      console.log('Closing PostgreSQL connection pool...');
      await pool.end();
      console.log('PostgreSQL connection pool closed cleanly.');
    } catch (err) {
      console.error('Error closing PostgreSQL pool:', err);
    }
  } else if (sqliteDb) {
    try {
      sqliteDb.close();
      console.log('SQLite database closed.');
    } catch (err) {
      console.error('Error closing SQLite database:', err);
    }
  }
}
