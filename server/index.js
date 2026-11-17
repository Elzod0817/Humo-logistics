import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { authRouter } from './routes/authRoutes.js';
import { profileRouter } from './routes/profileRoutes.js';
import { listingRouter } from './routes/listingRoutes.js';
import { transportRouter } from './routes/transportRoutes.js';
import { chatRouter } from './routes/chatRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { subscriptionRouter } from './routes/subscriptionRoutes.js';
import { supportRouter } from './routes/supportRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { channelRouter } from './routes/channelRoutes.js';
import { cargoDirectoryRouter } from './routes/cargoDirectoryRoutes.js';
import { authMiddleware, requireAuth } from './auth.js';
import { 
  db, 
  isPg, 
  initDatabase, 
  seedDefaultAdmin, 
  seedDefaultPlans, 
  seedPaymentSettings, 
  seedSupportAndSocials, 
  seedDefaultChannels,
  seedDefaultCargoCompanies,
  promoteToAdmin,
  closeDatabase 
} from './db.js';
import { LOCATIONS_DATA, BODY_TYPES, BUSINESS_ROLES } from './locations.js';
import { 
  securityHeaders, 
  xssSanitizer, 
  authLimiter, 
  aiLimiter, 
  generalApiLimiter,
  resetAllRateLimits
} from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, '../public');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Hardening: Disable information disclosure headers & attach HTTP defense headers
app.disable('x-powered-by');
app.use(securityHeaders);

// Standard Middlewares
app.use(cors());
app.use(cookieParser());

// Strict Payload Limits (mitigate memory exhaustion & buffer overflow attacks)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Input sanitization against Stored & Reflected XSS
app.use(xssSanitizer);

// Attach authenticated user session if present
app.use(authMiddleware);

// Serve static frontend assets
app.use(express.static(publicPath));
app.use('/public', express.static(publicPath));
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Production Health Endpoint for Render.com zero-downtime health probes
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1;');
    res.json({
      status: 'ok',
      db: isPg ? 'postgres' : 'sqlite',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      db: isPg ? 'postgres' : 'sqlite',
      uptime: Math.floor(process.uptime()),
      error: err.message
    });
  }
});

// Internal test rate limit reset endpoint
app.post('/api/test/reset-rate-limits', (req, res) => {
  resetAllRateLimits();
  res.json({ ok: true, message: 'All rate limits reset' });
});

// Locations and taxonomy metadata endpoint
app.get('/api/metadata', (req, res) => {
  res.json({
    locations: LOCATIONS_DATA,
    body_types: BODY_TYPES,
    business_roles: BUSINESS_ROLES
  });
});

// Public platform live statistics for mobile Home screen
app.get('/api/stats', async (req, res) => {
  try {
    const [loads, transports, cargoCompanies, users] = await Promise.all([
      db.queryOne("SELECT COUNT(*) as count FROM listings WHERE status = 'active'"),
      db.queryOne("SELECT COUNT(*) as count FROM transports WHERE status = 'active'"),
      db.queryOne("SELECT COUNT(*) as count FROM cargo_companies"),
      db.queryOne("SELECT COUNT(*) as count FROM users WHERE is_banned = FALSE")
    ]);
    res.json({
      activeLoads: Number(loads?.count || 0),
      activeTransports: Number(transports?.count || 0),
      cargoCompanies: Number(cargoCompanies?.count || 0),
      totalUsers: Math.max(1, Number(users?.count || 0))
    });
  } catch (err) {
    console.error('Error fetching platform stats:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch platform metrics' });
  }
});

// Multi-Tier In-Memory Rate Limiting
// 1. Auth endpoints: max 10 attempts per 15 min per IP to block credential stuffing & brute force
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-reset-otp', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// 2. AI endpoints: max 25 requests per hour per user/IP
app.use('/api/ai', aiLimiter);

// 3. General API endpoints: max 120 requests per minute per IP to prevent flood & DDoS
app.use('/api', generalApiLimiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/listings', listingRouter);
app.use('/api/transports', transportRouter);
app.use('/api/chat', chatRouter);
app.use('/api/messages', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/support', supportRouter);
app.use('/api/ai', aiRouter);
app.use('/api/channels', channelRouter);
app.use('/api/cargo-directory', cargoDirectoryRouter);

// Aggregated My Listings endpoint
app.get('/api/my-listings', requireAuth, async (req, res) => {
  try {
    const cargos = await db.queryAll('SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const transports = await db.queryAll('SELECT * FROM transports WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({
      cargos,
      transports,
      all: [
        ...cargos.map(c => ({ ...c, listing_type: 'cargo' })),
        ...transports.map(t => ({ ...t, listing_type: 'transport' }))
      ]
    });
  } catch (err) {
    console.error('Error fetching my listings:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch my listings' });
  }
});

// Dedicated Admin Web Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin.html'));
});

// Fallback to index.html for SPA client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'not_found', message: 'API route not found' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global error handler (handles 413 Payload Too Large and internal exceptions)
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      error: 'payload_too_large',
      message: 'Payload size exceeds 100kb limit'
    });
  }
  console.error('Server error:', err);
  const status = (err.status && err.status >= 400 && err.status < 600) ? err.status : 500;
  res.status(status).json({
    error: err.code || err.brevoCode || 'server_error',
    message: err.message || 'Internal server error'
  });
});

let serverInstance = null;

// Graceful shutdown handler for Render.com SIGTERM and local SIGINT
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('HTTP server closed.');
      await closeDatabase();
      process.exit(0);
    });
    // Force exit if connections take longer than 10 seconds to drain
    setTimeout(() => {
      console.error('Graceful shutdown timeout, forcing exit.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function startServer() {
  await initDatabase();
  await seedDefaultAdmin();
  await seedDefaultPlans();
  await seedPaymentSettings();
  await seedSupportAndSocials();
  await seedDefaultChannels();
  await seedDefaultCargoCompanies();

  // CLI support: node server/index.js --promote-admin <email>
  const promoteIdx = process.argv.indexOf('--promote-admin');
  if (promoteIdx !== -1 && process.argv[promoteIdx + 1]) {
    const targetEmail = process.argv[promoteIdx + 1];
    const promoted = await promoteToAdmin(targetEmail);
    if (promoted) {
      console.log(`Successfully promoted ${targetEmail} to admin.`);
    } else {
      console.error(`User with email ${targetEmail} not found.`);
    }
    process.exit(0);
  }

  serverInstance = app.listen(PORT, () => {
    console.log(`Humo Logistics server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
