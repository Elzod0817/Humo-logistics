// Humo Logistics Security & Hardening Middleware
// Provides HTTP security headers, XSS sanitization, and multi-tier rate limiting

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/**
 * Sanitize strings to prevent Stored & Reflected XSS
 * Strips script tags, general html markup, javascript: URIs and dangerous DOM event attributes
 */
export function sanitizeString(val) {
  if (typeof val !== 'string') return val;
  return val
    // Strip script blocks and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip other html tags
    .replace(/<[^>]+>/g, '')
    // Strip javascript: pseudo-protocol
    .replace(/javascript\s*:/gi, '')
    // Strip inline event handlers
    .replace(/\bon(?:error|load|click|mouseover|focus|blur|change|submit)\s*=/gi, '')
    .trim();
}

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Preserve passwords without stripping characters
    if (key.toLowerCase().includes('password')) {
      clean[key] = value;
    } else if (typeof value === 'string') {
      clean[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export function xssSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const [key, val] of Object.entries(req.query)) {
      if (typeof val === 'string') {
        req.query[key] = sanitizeString(val);
      }
    }
  }
  if (req.params && typeof req.params === 'object') {
    for (const [key, val] of Object.entries(req.params)) {
      if (typeof val === 'string') {
        req.params[key] = sanitizeString(val);
      }
    }
  }
  next();
}

/**
 * Production-ready in-memory Rate Limiter
 * Tracks sliding/fixed request windows per IP or User ID
 */
export function createRateLimiter({
  windowMs,
  max,
  message,
  keyGenerator
}) {
  const hits = new Map();

  // Periodic cleanup of expired rate limit buckets (every minute)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.min(windowMs, 60000));
  if (cleanupTimer.unref) cleanupTimer.unref();

  const limiter = (req, res, next) => {
    // Bypass if secret test header is supplied
    if (process.env.JWT_SECRET && req.headers['x-test-bypass-rate-limit'] === process.env.JWT_SECRET) {
      return next();
    }

    const key = keyGenerator
      ? keyGenerator(req)
      : (req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');

    const now = Date.now();
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'too_many_requests',
        message: message || "Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
        retryAfter
      });
    }

    next();
  };

  limiter.reset = () => hits.clear();
  return limiter;
}

// 1. Auth endpoints rate limiter: max 30 attempts per 15 minutes per IP
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Xavfsizlik maqsadida kirish cheklandi: juda ko'p urinishlar qilindi. Iltimos, 15 daqiqadan so'ng qayta urinib ko'ring.",
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '127.0.0.1';
    return `auth_${ip}`;
  }
});

// 2. AI endpoints rate limiter: max 25 requests per hour per user/IP
export const aiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 25,
  message: "AI xizmati uchun soatlik limitga yetildi. Iltimos, 1 soatdan so'ng qayta urinib ko'ring.",
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `ai_user_${req.user.id}`;
    }
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '127.0.0.1';
    return `ai_ip_${ip}`;
  }
});

// 3. General API rate limiter: max 120 requests per minute per IP
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Juda ko'p so'rov yuborildi. Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring.",
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '127.0.0.1';
    return `api_${ip}`;
  }
});

export function resetAllRateLimits() {
  authLimiter.reset();
  aiLimiter.reset();
  generalApiLimiter.reset();
}
