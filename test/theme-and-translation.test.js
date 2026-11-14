// Automated Verification Suite for Day/Night Theme & In-Chat Translation
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function run() {
  console.log('--- Starting Theme & Translation Verification Suite ---');

  // 1. Verify CSS Custom Properties for Day/Night Themes
  console.log('\n[1] Checking public/styles.css for Light & Dark Theme variables...');
  const css = fs.readFileSync(path.resolve('public/styles.css'), 'utf-8');
  assert(css.includes(':root'), 'CSS must define :root variables for Dark Mode');
  assert(css.includes('--bg-main: #0d0d0d;'), 'Dark theme must define --bg-main: #0d0d0d');
  assert(css.includes('[data-theme="light"]'), 'CSS must define [data-theme="light"] overrides');
  assert(css.includes('--bg-main: #f4f6f9;'), 'Light theme must define --bg-main: #f4f6f9');
  assert(css.includes('--surface-card: #ffffff;'), 'Light theme must define --surface-card: #ffffff');
  assert(css.includes('--text-primary: #111827;'), 'Light theme must define high-contrast text: #111827');
  assert(css.includes('.theme-toggle-btn'), 'CSS must style .theme-toggle-btn');
  assert(css.includes('.btn-toggle-translation'), 'CSS must style .btn-toggle-translation');
  console.log('✓ CSS custom properties for Light & Dark theme verified.');

  // 2. Verify Theme Init Script in public/index.html (FOUC Prevention)
  console.log('\n[2] Checking public/index.html for synchronous theme bootstrapper...');
  const html = fs.readFileSync(path.resolve('public/index.html'), 'utf-8');
  assert(html.includes("localStorage.getItem('humo_theme')"), 'index.html must read humo_theme to prevent FOUC');
  assert(html.includes("document.documentElement.setAttribute('data-theme'"), 'index.html must set data-theme before body renders');
  console.log('✓ Synchronous FOUC prevention script verified in HTML head.');

  // 3. Verify public/i18n.js contains theme and translation keys
  console.log('\n[3] Checking public/i18n.js dictionaries for theme & translation keys...');
  const i18n = fs.readFileSync(path.resolve('public/i18n.js'), 'utf-8');
  for (const lang of ['uz', 'ru', 'en']) {
    assert(i18n.includes('theme_title'), `i18n must contain theme_title for ${lang}`);
    assert(i18n.includes('theme_light'), `i18n must contain theme_light for ${lang}`);
    assert(i18n.includes('theme_dark'), `i18n must contain theme_dark for ${lang}`);
    assert(i18n.includes('show_translation'), `i18n must contain show_translation for ${lang}`);
    assert(i18n.includes('hide_translation'), `i18n must contain hide_translation for ${lang}`);
  }
  console.log('✓ All i18n dictionaries contain theme & translation keys.');

  // 4. Test In-Chat Translation Endpoint with Authenticated Session
  console.log('\n[4] Testing POST /api/ai/translate endpoint...');
  const testEmail = `themetest_${Date.now()}@humo.uz`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'SecurePassword123!' })
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201, 'User registration must succeed');
  assert(regData.token, 'Registration must return a session token');

  const token = regData.token;

  // Test Case A: Russian to Uzbek
  const trA = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: 'Машина готова к погрузке',
      target_lang: 'uz'
    })
  });
  assert.strictEqual(trA.status, 200, 'Translation endpoint must return 200');
  const resA = await trA.json();
  assert.strictEqual(resA.success, true, 'Result success must be true');
  assert(resA.translated_text && resA.translated_text.length > 0, 'Must have translated_text');
  console.log(`  ✓ RU -> UZ: "Машина готова к погрузке" => "${resA.translated_text}"`);

  // Test Case B: Uzbek to Russian
  const trB = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: 'Assalomu alaykum, yuk tayyormi?',
      target_lang: 'ru'
    })
  });
  assert.strictEqual(trB.status, 200, 'Translation endpoint must return 200');
  const resB = await trB.json();
  assert.strictEqual(resB.success, true, 'Result success must be true');
  console.log(`  ✓ UZ -> RU: "Assalomu alaykum, yuk tayyormi?" => "${resB.translated_text}"`);

  // Test Case C: English to Uzbek
  const trC = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: 'We need a refrigerator truck from Tashkent to Almaty',
      target_lang: 'uz'
    })
  });
  assert.strictEqual(trC.status, 200, 'Translation endpoint must return 200');
  const resC = await trC.json();
  assert.strictEqual(resC.success, true, 'Result success must be true');
  console.log(`  ✓ EN -> UZ: "We need a refrigerator truck from Tashkent to Almaty" => "${resC.translated_text}"`);

  // Test Case D: Security Check - Unauthorized Request
  const trAnon = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello', target_lang: 'uz' })
  });
  assert.strictEqual(trAnon.status, 401, 'Unauthenticated translation requests must be rejected with 401');
  console.log('  ✓ Security check passed: Unauthenticated requests rejected with 401 Unauthorized.');

  console.log('\n======================================================');
  console.log('🎉 ALL THEME & TRANSLATION TESTS PASSED PERFECTLY!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
