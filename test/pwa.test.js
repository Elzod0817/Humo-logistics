import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

async function testPwa() {
  console.log('--- Starting Progressive Web App (PWA) Verification ---');

  // [1] Verify Web App Manifest
  console.log('\n[1] Verifying Web App Manifest (/manifest.json)...');
  const manifestRes = await fetch(`${BASE_URL}/manifest.json`);
  assert.equal(manifestRes.status, 200, 'Manifest must return HTTP 200');
  const manifest = await manifestRes.json();
  
  assert.equal(manifest.name, 'Humo Logistics — Yuk va Transport Birjasi');
  assert.equal(manifest.short_name, 'Humo Logistics');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait-primary');
  assert.equal(manifest.theme_color, '#0d0d0d');
  assert.equal(manifest.background_color, '#0d0d0d');
  assert.equal(manifest.start_url, '/#/');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Manifest must have at least 2 icons');
  
  const icon192 = manifest.icons.find(i => i.sizes === '192x192');
  const icon512 = manifest.icons.find(i => i.sizes === '512x512');
  assert.ok(icon192, 'Manifest must include 192x192 icon');
  assert.ok(icon512, 'Manifest must include 512x512 icon');
  assert.ok(icon192.purpose.includes('maskable'), '192 icon must be maskable');
  console.log('✓ manifest.json is fully valid and conforms to PWA standards.');

  // [2] Verify Icons HTTP Accessibility
  console.log('\n[2] Verifying PWA PNG Icons accessibility...');
  const icon192Res = await fetch(`${BASE_URL}${icon192.src}`);
  assert.equal(icon192Res.status, 200, '192x192 icon must return 200');
  assert.ok(icon192Res.headers.get('content-type').includes('image/png'), '192 icon must be image/png');
  
  const icon512Res = await fetch(`${BASE_URL}${icon512.src}`);
  assert.equal(icon512Res.status, 200, '512x512 icon must return 200');
  assert.ok(icon512Res.headers.get('content-type').includes('image/png'), '512 icon must be image/png');
  console.log('✓ Both 192x192 and 512x512 icons return 200 OK with image/png MIME type.');

  // [3] Verify Service Worker
  console.log('\n[3] Verifying Service Worker (/sw.js)...');
  const swRes = await fetch(`${BASE_URL}/sw.js`);
  assert.equal(swRes.status, 200, 'sw.js must return HTTP 200');
  assert.ok(swRes.headers.get('content-type').includes('javascript'), 'sw.js must be javascript');
  const swCode = await swRes.text();
  assert.ok(swCode.includes('STATIC_ASSETS'), 'Service worker must define precache assets');
  assert.ok(swCode.includes('/api/'), 'Service worker must handle /api/ requests');
  assert.ok(swCode.includes('skipWaiting'), 'Service worker must activate immediately on skipWaiting');
  console.log('✓ Service Worker is served properly with caching & network-first rules.');

  // [4] Verify index.html PWA tags
  console.log('\n[4] Verifying HTML Head Meta & Manifest Link...');
  const htmlRes = await fetch(`${BASE_URL}/`);
  assert.equal(htmlRes.status, 200);
  const html = await htmlRes.text();
  assert.ok(html.includes('<link rel="manifest" href="/manifest.json">'), 'Missing manifest link in index.html');
  assert.ok(html.includes('<meta name="theme-color" content="#0d0d0d">'), 'Missing theme-color meta tag');
  assert.ok(html.includes('<meta name="apple-mobile-web-app-capable" content="yes">'), 'Missing iOS standalone meta');
  assert.ok(html.includes('<link rel="apple-touch-icon" href="/icons/icon-192.png">'), 'Missing apple-touch-icon link');
  console.log('✓ index.html properly links manifest and all iOS/PWA meta headers.');

  // [5] Verify Trilingual Translations
  console.log('\n[5] Verifying PWA Translations (UZ, RU, EN)...');
  const { TRANSLATIONS } = await import('../public/i18n.js');
  for (const lang of ['uz', 'ru', 'en']) {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict.pwa_install_btn, `Missing pwa_install_btn in ${lang}`);
    assert.ok(dict.pwa_install_title, `Missing pwa_install_title in ${lang}`);
    assert.ok(dict.pwa_install_desc, `Missing pwa_install_desc in ${lang}`);
    assert.ok(dict.pwa_installed_success, `Missing pwa_installed_success in ${lang}`);
    assert.ok(dict.pwa_ios_guide_title, `Missing pwa_ios_guide_title in ${lang}`);
  }
  console.log('✓ All PWA keys translated across Uzbek, Russian, and English.');

  console.log('\n======================================================');
  console.log('🎉 ALL PWA VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('======================================================\n');
}

testPwa().catch(err => {
  console.error('\n❌ PWA Test Failed:', err);
  process.exit(1);
});
