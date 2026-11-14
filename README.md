# Humo Logistics — Freight & Transport Marketplace

<div align="center">
  <img src="public/icons/icon-512.png" alt="Humo Logistics Emblem" width="128" height="128" />
  <h3>O'zbekiston va xalqaro yo'nalishlar bo'yicha ishonchli yuk tashish va transport bozori</h3>
  <p>Modern, secure, high-performance freight exchange marketplace for shippers, carriers, and dispatchers across Uzbekistan, Central Asia, CIS, Turkey, and China.</p>
</div>

---

## 🚀 Key Platform Features

- **🚛 Cargo & Truck Exchange**:
  - Dual-mode listing directory (Available Cargo & Empty Trucks).
  - Multi-criteria route search with country & city filtering, vehicle body types (curtainsider, ref, flatbed, isothermal, etc.), and weight/volume capacity sorting.
  - Interactive status controls (active, closed, reactivate).

- **📱 Progressive Web App (PWA)**:
  - Installable on Android, iOS, and Desktop with full-screen standalone experience.
  - Offline app shell caching via custom Service Worker (`/sw.js`).
  - Web App Manifest conforming to mobile standards with maskable icons.

- **🤖 Humo Logistics AI System**:
  - **Stage 1 (AI Smart Parser)**: Extracts structured parameters from raw logistics text (e.g. Telegram freight posts) and auto-fills cargo & truck publish forms.
  - **Stage 2 (AI Smart Matching)**: Deterministic route & body-type candidate filtering combined with AI-powered top-3 candidate ranking.
  - **Stage 3 (Humo AI Dispatcher)**: Floating glassmorphic assistant widget providing guidance on routes, rates, vehicle specs, and customs documents (CMR, TIR Carnet).
  - **Stage 4 (In-Chat One-Click Translator)**: Instant in-chat message translations between Uzbek, Russian, and English (`uz` ⇄ `ru` ⇄ `en`).

- **💳 Monetization & Contact Access**:
  - **117 Free Contacts**: Every new user starts with 117 free contact views.
  - **Phone Masking & Unlocking**: Contact numbers are masked (`+998 90 *** ** **`) until unlocked by the viewer or subscriber.
  - **Tiered Subscription Plans**: Start (Free), Pro Dispatcher (Unlimited contacts + Verified badge), and Business/Fleet.
  - **Requisite Management & Receipts**: Peer-to-peer card transfers (Uzcard/Humo) with receipt note upload and one-click admin approval.

- **💬 Real-Time In-Chat Negotiations**:
  - Direct buyer-seller conversations linked to listings with route banner context.
  - Rate negotiation offer widgets with currency selection.
  - Live unread message counters, auto-scroll, and mobile-friendly conversational UI.

---

## 🛡️ Production Security & Performance Hardening

Humo Logistics is hardened against cyber attacks and optimized for production deployment on **Render.com** and **Supabase PostgreSQL**:

- **HTTP Defense Headers**:
  - `X-Content-Type-Options: nosniff` (MIME sniffing mitigation)
  - `X-Frame-Options: DENY` (Clickjacking prevention)
  - `X-XSS-Protection: 1; mode=block` (Reflected XSS filter)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - Disabled `X-Powered-By` (Fingerprinting protection)

- **Multi-Tier In-Memory Rate Limiting**:
  - **Auth (`/api/auth/login`, `/api/auth/register`)**: Max 10 attempts per 15 minutes per IP (Brute-force & credential stuffing defense).
  - **AI (`/api/ai/*`)**: Max 25 requests per hour per user/IP (Quota & resource guard).
  - **General API (`/api/*`)**: Max 120 requests per minute per IP (DDoS & volumetric flood shield).

- **Input Sanitization & Stored XSS Neutralization**:
  - Recursive sanitation stripping `<script>`, `<iframe>`, `javascript:`, and inline event attributes (`onerror=`, `onload=`, `onmouseover=`).
  - Passwords remain strictly preserved and hashed using cryptographically secure algorithms.

- **SQL Injection 100% Immunity**:
  - All queries are parameterized (`$1, $2...`) across both PostgreSQL and SQLite.

- **Strict Payload Limits**:
  - `100kb` body limit (`express.json({ limit: '100kb' })`) returning clean `413 Payload Too Large`.

- **Database Connection Pooling (`pg.Pool`)**:
  - Bounded pool (`max: 15`), 30-second idle timeouts, and composite indexes on high-frequency query paths.
  - Graceful shutdown (`SIGTERM` / `SIGINT`) cleanly closing pool connections during rolling deploys.

- **Zero-Downtime Health Probes**:
  - `GET /api/health` returning live database ping (`SELECT 1;`), uptime, and database driver mode (`postgres` / `sqlite`).

---

## 🛠️ Tech Stack

- **Backend**: Node.js (ES Modules), Express 5
- **Database**: Dual-Database Architecture:
  - **Production**: Supabase PostgreSQL (`pg.Pool` with TLS/SSL)
  - **Development/Fallback**: Local SQLite (`node:sqlite`)
- **Frontend**: Lightweight Vanilla JavaScript (SPA), Mobile-Responsive CSS with Glassmorphic micro-animations, Phosphor-style vector SVGs.
- **PWA**: Web App Manifest, Cache API Service Worker.
- **AI**: Google Gemini API (`@google/genai` / REST integration).

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18 or higher, Node 20+ recommended)
- Git

### 2. Installation
```bash
git clone https://github.com/Elzod0817/Humo-logistics.git
cd Humo-logistics
npm install
```

### 3. Environment Setup
Copy the sample environment file:
```bash
cp .env.example .env
```

Configure your `.env` variables:
```env
# Provide DATABASE_URL for Supabase PostgreSQL (or leave empty to use local SQLite)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres

JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=admin@humologistics.uz
ADMIN_PASSWORD=YourAdminPassword123!
PORT=3000

# Optional: Google Gemini API Key for AI Smart Parser & Assistant
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running the Application
```bash
# Start production server
npm start

# Or start development server with file watching
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 🧪 Automated Testing Suites

Humo Logistics includes a comprehensive automated test battery:

```bash
# Run End-to-End User Journey Tests (42 Tests)
npm run test

# Run Progressive Web App (PWA) Verification (5 Tests)
npm run test:pwa

# Run Cyber Security Penetration & 100-Concurrent-Request Stress Test
npm run test:security

# Run All Test Suites
npm run test:all
```

---

## 🚢 Deployment on Render.com

1. Create a **Web Service** on [Render.com](https://render.com).
2. Connect your GitHub repository (`Elzod0817/Humo-logistics`).
3. Set **Runtime** to `Node`.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add Environment Variables from your `.env` (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`).
7. Set **Health Check Path**: `/api/health`

---

## 📄 License

This project is licensed under the **ISC License**.
