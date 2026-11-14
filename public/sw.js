// Humo Logistics Service Worker - v1.1
const CACHE_NAME = 'humo-logistics-v1.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/i18n.js',
  '/manifest.json',
  '/bird.png',
  '/bird-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: Cache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to precache during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy based on URL path
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests with http/https schemes
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API Requests: STRICT NETWORK-FIRST (live freight data, never serve stale cache for DB operations)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Oflayn rejim: internetga ulanish mavjud emas',
            offline: true
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      })
    );
    return;
  }

  // Navigation requests (HTML pages / SPA route refresh): Network first with offline fallback to /index.html
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      }).catch(async () => {
        const cached = await caches.match('/index.html') || await caches.match('/');
        return cached || new Response('<h1>Humo Logistics</h1><p>Internetga ulanish yo\'q</p>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
    );
    return;
  }

  // Static Assets (CSS, JS, Images, Fonts, Manifest): Cache-first with background network revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
