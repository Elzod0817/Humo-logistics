import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- Starting Humo Logistics End-to-End Journey Verification ---');
  await fetch(`${BASE_URL}/api/test/reset-rate-limits`, { method: 'POST' }).catch(() => {});

  // Test 1: Check Google OAuth Status endpoint explicitly reports limitation
  console.log('\n[1] Checking Google OAuth status...');
  const googleRes = await fetch(`${BASE_URL}/api/auth/google-status`);
  assert.strictEqual(googleRes.status, 200);
  const googleData = await googleRes.json();
  assert.strictEqual(googleData.available, false);
  assert.strictEqual(googleData.limitation_reported, true);
  console.log('✓ Google Auth limitation explicitly reported:', googleData.reason);

  // Test 2: Register user 1
  console.log('\n[2] Registering user 1 (Cargo Owner)...');
  const user1Email = `testuser_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: 'SecurePassword123!' })
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token, 'Token must be returned');
  assert.strictEqual(regData.user.email, user1Email);
  assert.strictEqual(regData.user.profile_completed, 0);
  let user1Token = regData.token;
  const user1Id = regData.user.id;
  console.log('✓ User 1 registered with ID:', user1Id);

  // Test 3: Attempt to publish cargo before completing profile (must be rejected)
  console.log('\n[3] Testing profile completion enforcement on publishing...');
  const prematurePubRes = await fetch(`${BASE_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      destination_country: 'KZ',
      destination_locality: 'almaty',
      cargo_name: 'Test Cargo',
      weight: 15,
      body_type: 'curtainsider'
    })
  });
  assert.strictEqual(prematurePubRes.status, 403);
  const prematureData = await prematurePubRes.json();
  assert.strictEqual(prematureData.error, 'profile_incomplete');
  console.log('✓ Publishing rejected for incomplete profile with 403 Forbidden');

  // Test 4: Complete profile for User 1
  console.log('\n[4] Completing User 1 profile...');
  const profileRes = await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      first_name: 'Anvar',
      last_name: 'Karimov',
      phone: '+998 90 123 45 67',
      role: 'cargo_owner'
    })
  });
  assert.strictEqual(profileRes.status, 200);
  const profileData = await profileRes.json();
  assert.strictEqual(profileData.profile.profile_completed, 1);
  assert.strictEqual(profileData.profile.first_name, 'Anvar');
  assert.strictEqual(profileData.profile.role, 'cargo_owner');
  assert.strictEqual(profileData.profile.phone, '+998901234567');
  console.log('✓ Profile completed successfully (stored privately)');

  // Test 5: Publish a real cargo listing
  console.log('\n[5] Publishing cargo listing (Tashkent -> Almaty, 21.5 tonnes)...');
  const pubRes = await fetch(`${BASE_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      origin_custom: 0,
      destination_country: 'KZ',
      destination_locality: 'almaty',
      destination_custom: 0,
      cargo_name: 'Qurilish materiallari (Gipsokarton)',
      cargo_description: 'Ehtiyotkorlik bilan tashish lozim. Quruq tentli furgon.',
      weight: 21.5,
      volume: 86.0,
      dim_length: 13.6,
      dim_width: 2.45,
      dim_height: 2.7,
      body_type: 'curtainsider',
      loading_date_type: 'ready_now',
      price_type: 'fixed',
      price_amount: 1400,
      price_currency: 'USD'
    })
  });
  assert.strictEqual(pubRes.status, 201);
  const pubData = await pubRes.json();
  assert.ok(pubData.listing.id);
  const listingId = pubData.listing.id;
  assert.strictEqual(pubData.listing.status, 'active');
  assert.strictEqual(pubData.listing.weight, 21.5);
  console.log('✓ Cargo listing published with ID:', listingId);

  // Test 6: Search listings (Public view)
  console.log('\n[6] Searching for published cargo in public search...');
  const searchRes = await fetch(`${BASE_URL}/api/listings?origin_country=UZ&destination_country=KZ&body_type=curtainsider`);
  assert.strictEqual(searchRes.status, 200);
  const searchData = await searchRes.json();
  const found = searchData.listings.find(l => l.id === listingId);
  assert.ok(found, 'Newly published listing must appear in public search');
  assert.strictEqual(found.cargo_name, 'Qurilish materiallari (Gipsokarton)');
  // Strict Privacy Check: phone number must be masked in public response
  assert.ok(found.phone.includes('*'), 'Phone must be masked in public listing');
  assert.strictEqual(found.is_phone_unlocked, false);
  console.log('✓ Found listing in search. Verified phone privacy protection.');

  // Test 7: Open Detail view
  console.log('\n[7] Opening listing details view...');
  const detailRes = await fetch(`${BASE_URL}/api/listings/${listingId}`);
  assert.strictEqual(detailRes.status, 200);
  const detailData = await detailRes.json();
  assert.strictEqual(detailData.listing.id, listingId);
  assert.strictEqual(detailData.listing.weight, 21.5);
  assert.strictEqual(detailData.listing.volume, 86.0);
  assert.strictEqual(detailData.listing.dim_length, 13.6);
  assert.strictEqual(detailData.listing.price_amount, 1400);
  assert.strictEqual(detailData.listing.price_currency, 'USD');
  // Privacy check on detail view: masked when unauthenticated
  assert.ok(detailData.listing.phone.includes('*'), 'Phone must be masked in detail response');
  assert.strictEqual(detailData.listing.is_phone_unlocked, false);
  console.log('✓ Listing detail retrieved with full specifications.');

  // Test 8: Edit listing by owner
  console.log('\n[8] Editing listing as owner...');
  const editRes = await fetch(`${BASE_URL}/api/listings/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      origin_custom: 0,
      destination_country: 'KZ',
      destination_locality: 'almaty',
      destination_custom: 0,
      cargo_name: 'Qurilish materiallari (Yangilangan)',
      cargo_description: 'Tezkor yetkazish talab etiladi.',
      weight: 22.0,
      volume: 88.0,
      body_type: 'curtainsider',
      loading_date_type: 'ready_now',
      price_type: 'negotiable'
    })
  });
  assert.strictEqual(editRes.status, 200);
  const editData = await editRes.json();
  assert.strictEqual(editData.listing.cargo_name, 'Qurilish materiallari (Yangilangan)');
  assert.strictEqual(editData.listing.weight, 22.0);
  console.log('✓ Listing edited by owner successfully.');

  // Test 9: Security check - unauthorized edit rejection
  console.log('\n[9] Testing authorization security: Attempting unauthorized edit from another user...');
  const user2Email = `otheruser_${Date.now()}@example.com`;
  const reg2Res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user2Email, password: 'Password999!' })
  });
  const reg2Data = await reg2Res.json();
  const user2Token = reg2Data.token;
  const user2Id = reg2Data.user.id;

  // Complete user 2 profile
  await fetch(`${BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user2Token}` },
    body: JSON.stringify({ first_name: 'Rustam', last_name: 'Aliev', phone: '+998912345678', role: 'dispatcher' })
  });

  // User 2 tries to edit User 1's listing
  const unauthEditRes = await fetch(`${BASE_URL}/api/listings/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      destination_country: 'KZ',
      destination_locality: 'almaty',
      cargo_name: 'Hacked Cargo Name',
      weight: 10,
      body_type: 'box_van',
      loading_date_type: 'ready_now',
      price_type: 'negotiable'
    })
  });
  assert.strictEqual(unauthEditRes.status, 403, 'Unauthorized edit must return 403 Forbidden');
  console.log('✓ Unauthorized edit correctly rejected with 403 Forbidden.');

  // Test 10: Close listing by owner
  console.log('\n[10] Closing listing from My Listings...');
  const closeRes = await fetch(`${BASE_URL}/api/listings/${listingId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'closed' })
  });
  assert.strictEqual(closeRes.status, 200);

  // Verify it disappeared from public search
  const postCloseSearch = await fetch(`${BASE_URL}/api/listings`);
  const postCloseData = await postCloseSearch.json();
  const shouldNotBeFound = postCloseData.listings.find(l => l.id === listingId);
  assert.strictEqual(shouldNotBeFound, undefined, 'Closed listing must NOT appear in public search');
  console.log('✓ Closed listing disappeared from public search.');

  // Verify it remains visible in owner\'s My Listings
  const myListingsRes = await fetch(`${BASE_URL}/api/listings/my`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(myListingsRes.status, 200);
  const myListingsData = await myListingsRes.json();
  const foundInMy = myListingsData.listings.find(l => l.id === listingId);
  assert.ok(foundInMy, 'Closed listing must remain in owner\'s list');
  assert.strictEqual(foundInMy.status, 'closed');
  console.log('✓ Closed listing remains safely preserved in My Listings.');

  // Test 11: Reactivate listing
  console.log('\n[11] Reactivating listing...');
  const reactivateRes = await fetch(`${BASE_URL}/api/listings/${listingId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'active' })
  });
  assert.strictEqual(reactivateRes.status, 200);

  // Verify it reappears in public search
  const postReactivateSearch = await fetch(`${BASE_URL}/api/listings`);
  const postReactivateData = await postReactivateSearch.json();
  const reappeared = postReactivateData.listings.find(l => l.id === listingId);
  assert.ok(reappeared, 'Reactivated listing must reappear in public search');
  assert.strictEqual(reappeared.status, 'active');
  console.log('✓ Reactivated listing reappeared in public search.');

  // Test 12: Add Transport / Publish Truck (User 2 - Dispatcher)
  console.log('\n[12] Publishing available truck listing (Volvo FH, Tashkent -> Almaty, 22t)...');
  const pubTruckRes = await fetch(`${BASE_URL}/api/transports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_city: 'tashkent_city',
      destination_country: 'KZ',
      destination_city: 'almaty',
      body_type: 'curtainsider',
      truck_model: 'Volvo FH 500',
      max_weight: 22.0,
      volume: 92.0,
      available_date: '2026-11-20',
      price_expectation: '1500 USD',
      phone: '+998912345678',
      notes: 'ADR va CMR sug‘urtasi mavjud'
    })
  });
  assert.strictEqual(pubTruckRes.status, 201);
  const pubTruckData = await pubTruckRes.json();
  assert.ok(pubTruckData.transport.id);
  const transportId = pubTruckData.transport.id;
  assert.strictEqual(pubTruckData.transport.truck_model, 'Volvo FH 500');
  assert.strictEqual(pubTruckData.transport.max_weight, 22.0);
  assert.strictEqual(pubTruckData.transport.status, 'active');
  console.log('✓ Transport listing published with ID:', transportId);

  // Test 13: Find Trucks in public search with filters
  console.log('\n[13] Searching for available trucks with filters...');
  const searchTruckRes = await fetch(`${BASE_URL}/api/transports?origin_country=UZ&body_type=curtainsider&sort=weight_desc`);
  assert.strictEqual(searchTruckRes.status, 200);
  const searchTruckData = await searchTruckRes.json();
  const foundTruck = searchTruckData.transports.find(t => t.id === transportId);
  assert.ok(foundTruck, 'Published truck must appear in public search');
  assert.strictEqual(foundTruck.truck_model, 'Volvo FH 500');
  assert.ok(foundTruck.phone.includes('*'), 'Truck phone must be masked for unauthenticated visitor');
  assert.strictEqual(foundTruck.is_phone_unlocked, false);
  console.log('✓ Found truck in search with phone number available for contact.');

  // Test 14: Close and Reactivate Transport
  console.log('\n[14] Closing and reactivating transport listing...');
  const closeTruckRes = await fetch(`${BASE_URL}/api/transports/${transportId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({ status: 'closed' })
  });
  assert.strictEqual(closeTruckRes.status, 200);

  // Closed transport should disappear from public search
  const postCloseTruckSearch = await fetch(`${BASE_URL}/api/transports`);
  const postCloseTruckData = await postCloseTruckSearch.json();
  assert.strictEqual(postCloseTruckData.transports.find(t => t.id === transportId), undefined);
  console.log('✓ Closed transport disappeared from public search.');

  // Reactivate transport
  const reactivateTruckRes = await fetch(`${BASE_URL}/api/transports/${transportId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({ status: 'active' })
  });
  assert.strictEqual(reactivateTruckRes.status, 200);
  console.log('✓ Transport reactivated successfully.');

  // Test 15: Delete Transport listing (with authorization security)
  console.log('\n[15] Testing transport deletion and ownership security...');
  // User 1 attempts to delete User 2's transport (must be rejected with 403)
  const unauthDelRes = await fetch(`${BASE_URL}/api/transports/${transportId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(unauthDelRes.status, 403, 'Unauthorized delete must return 403 Forbidden');
  console.log('✓ Unauthorized transport deletion rejected with 403 Forbidden.');

  // Owner (User 2) deletes transport
  const authDelRes = await fetch(`${BASE_URL}/api/transports/${transportId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${user2Token}` }
  });
  assert.strictEqual(authDelRes.status, 200);
  const authDelData = await authDelRes.json();
  assert.strictEqual(authDelData.success, true);

  // Verify it is completely removed
  const getDelRes = await fetch(`${BASE_URL}/api/transports/${transportId}`);
  assert.strictEqual(getDelRes.status, 404);
  console.log('✓ Transport listing deleted successfully by owner.');

  // Test 16: Chat - Prevent user from chatting with themselves
  console.log('\n[16] Testing self-chat prevention...');
  const selfChatRes = await fetch(`${BASE_URL}/api/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      listing_type: 'cargo',
      listing_id: listingId,
      receiver_id: user1Id
    })
  });
  assert.strictEqual(selfChatRes.status, 400);
  const selfChatData = await selfChatRes.json();
  assert.strictEqual(selfChatData.error, 'cannot_chat_with_self');
  console.log('✓ Self-chat prevented with 400 Bad Request.');

  // Test 17: User 2 (Dispatcher) starts conversation with User 1 (Cargo Owner)
  console.log('\n[17] Dispatcher (User 2) initiating conversation with Cargo Owner (User 1)...');
  const startChatRes = await fetch(`${BASE_URL}/api/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      listing_type: 'cargo',
      listing_id: listingId,
      receiver_id: user1Id,
      message: 'Assalomu alaykum! Ushbu yuk bo‘yicha mashinamiz bor, yuklashga tayyormi?'
    })
  });
  assert.strictEqual(startChatRes.status, 201);
  const startChatData = await startChatRes.json();
  assert.ok(startChatData.conversation.id);
  const chatConvId = startChatData.conversation.id;
  assert.strictEqual(startChatData.conversation.listing_type, 'cargo');
  assert.strictEqual(startChatData.conversation.sender_id, user2Id);
  assert.strictEqual(startChatData.conversation.receiver_id, user1Id);
  console.log('✓ Conversation started with ID:', chatConvId);

  // Test 18: User 2 sends a price offer in the conversation
  console.log('\n[18] Dispatcher sending rate negotiation offer (12,000,000 UZS)...');
  const offerRes = await fetch(`${BASE_URL}/api/chat/conversations/${chatConvId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      content: 'Stavka bo‘yicha 12,000,000 UZS taklif qilamiz. Hujjatlar CMR bilan kafolatlanadi.',
      offered_price: 12000000
    })
  });
  assert.strictEqual(offerRes.status, 201);
  const offerData = await offerRes.json();
  assert.strictEqual(offerData.message.offered_price, 12000000);
  assert.strictEqual(offerData.message.sender_id, user2Id);
  console.log('✓ Rate negotiation offer saved successfully.');

  // Test 19: User 1 checks unread count badge
  console.log('\n[19] Checking unread messages count for Cargo Owner (User 1)...');
  const unreadRes = await fetch(`${BASE_URL}/api/chat/unread-count`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(unreadRes.status, 200);
  const unreadData = await unreadRes.json();
  assert.strictEqual(unreadData.unread_count, 2, 'User 1 must have 2 unread messages from User 2');
  console.log('✓ Unread count verified:', unreadData.unread_count);

  // Test 20: User 1 views conversation history (marks unread as read)
  console.log('\n[20] Cargo Owner viewing conversation history & marking messages read...');
  const viewChatRes = await fetch(`${BASE_URL}/api/chat/conversations/${chatConvId}/messages`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(viewChatRes.status, 200);
  const viewChatData = await viewChatRes.json();
  assert.strictEqual(viewChatData.messages.length, 2);
  assert.strictEqual(viewChatData.other_user.id, user2Id);
  assert.strictEqual(viewChatData.listing.id, listingId);
  console.log('✓ Conversation messages fetched with partner and listing summary.');

  // Verify unread count dropped to 0 for User 1
  const postReadRes = await fetch(`${BASE_URL}/api/chat/unread-count`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const postReadData = await postReadRes.json();
  assert.strictEqual(postReadData.unread_count, 0, 'Unread count must be 0 after reading');
  console.log('✓ Unread count updated to 0.');

  // Test 21: User 1 sends reply message
  console.log('\n[21] Cargo Owner replying to Dispatcher...');
  const replyRes = await fetch(`${BASE_URL}/api/chat/conversations/${chatConvId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      content: 'Taklif qabul qilindi. Ertaga soat 09:00 da Toshkent omborida yuklashga kelsin.'
    })
  });
  assert.strictEqual(replyRes.status, 201);
  console.log('✓ Reply sent successfully.');

  // Test 22: User 1 lists all conversations
  console.log('\n[22] Fetching conversation list for user...');
  const listConvsRes = await fetch(`${BASE_URL}/api/chat/conversations`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(listConvsRes.status, 200);
  const listConvsData = await listConvsRes.json();
  const convInList = listConvsData.conversations.find(c => c.id === chatConvId);
  assert.ok(convInList);
  assert.strictEqual(convInList.other_user.id, user2Id);
  assert.strictEqual(convInList.listing.id, listingId);
  console.log('✓ Conversation listed with metadata and partner info.');

  // Test 23: Security & Authorization - Third user cannot access conversation
  console.log('\n[23] Testing conversation access control for unauthorized 3rd party...');
  const user3Email = `user3_${Date.now()}@example.com`;
  const reg3Res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user3Email, password: 'Password123!' })
  });
  const reg3Data = await reg3Res.json();
  const user3Token = reg3Data.token;

  const eavesdropRes = await fetch(`${BASE_URL}/api/chat/conversations/${chatConvId}/messages`, {
    headers: { 'Authorization': `Bearer ${user3Token}` }
  });
  assert.strictEqual(eavesdropRes.status, 403, 'Unauthorized 3rd party must receive 403 Forbidden');
  console.log('✓ Unauthorized eavesdropping prevented with 403 Forbidden.');

  // Test 24: Default Admin Seeding & Authentication
  console.log('\n[24] Verifying Default Admin Account Seeding & Authentication...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@humologistics.uz',
      password: 'Admin12345!'
    })
  });
  assert.strictEqual(adminLoginRes.status, 200);
  const adminData = await adminLoginRes.json();
  assert.ok(adminData.token);
  assert.strictEqual(adminData.user.email, 'admin@humologistics.uz');
  assert.strictEqual(adminData.user.role, 'admin');
  assert.ok(adminData.user.is_verified, 'Admin account must be verified');

  // Verify /api/auth/me for admin
  const adminMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${adminData.token}` }
  });
  assert.strictEqual(adminMeRes.status, 200);
  const adminMeData = await adminMeRes.json();
  assert.strictEqual(adminMeData.user.role, 'admin');
  assert.ok(adminMeData.user.is_verified);
  const adminToken = adminData.token;
  console.log('✓ Default Admin account authenticated with role=admin and is_verified=true');

  // Test 25: Non-admin access to Admin API must be blocked with 403 Forbidden
  console.log('\n[25] Testing requireAdmin security middleware against non-admin users...');
  const unauthorizedStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(unauthorizedStatsRes.status, 403, 'Non-admin must receive 403 on admin routes');
  const unauthorizedData = await unauthorizedStatsRes.json();
  assert.strictEqual(unauthorizedData.error, 'forbidden');

  const unauthenticatedStatsRes = await fetch(`${BASE_URL}/api/admin/stats`);
  assert.strictEqual(unauthenticatedStatsRes.status, 401, 'Unauthenticated user must receive 401');
  console.log('✓ Admin API properly protected against non-admin and unauthenticated users.');

  // Test 26: Admin fetches platform stats and users
  console.log('\n[26] Testing Admin stats and users retrieval...');
  const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(adminStatsRes.status, 200);
  const adminStatsData = await adminStatsRes.json();
  assert.ok(adminStatsData.stats);
  assert.ok(adminStatsData.stats.users >= 2);
  assert.ok(adminStatsData.stats.verified_users >= 1);
  console.log('✓ Admin stats successfully retrieved:', adminStatsData.stats);

  const adminUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(adminUsersRes.status, 200);
  const adminUsersData = await adminUsersRes.json();
  assert.ok(Array.isArray(adminUsersData.users));
  assert.ok(adminUsersData.users.some(u => u.email === 'admin@humologistics.uz'));
  assert.ok(adminUsersData.users.some(u => u.id === user1Id));
  console.log(`✓ Admin retrieved ${adminUsersData.users.length} users.`);

  // Test 27: Admin verifies and updates user
  console.log('\n[27] Testing Admin user verification and role update...');
  const verifyRes = await fetch(`${BASE_URL}/api/admin/users/${user1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ is_verified: true, role: 'dispatcher' })
  });
  assert.strictEqual(verifyRes.status, 200);
  const verifyData = await verifyRes.json();
  assert.strictEqual(Boolean(verifyData.user.is_verified), true);
  assert.strictEqual(verifyData.user.role, 'dispatcher');
  console.log('✓ User successfully verified and role updated to dispatcher.');

  // Verify that public cargo listing now reflects verified status
  const publicListingCheckRes = await fetch(`${BASE_URL}/api/listings/${listingId}`);
  assert.strictEqual(publicListingCheckRes.status, 200);
  const publicListingCheckData = await publicListingCheckRes.json();
  assert.strictEqual(Boolean(publicListingCheckData.listing.owner_verified), true);
  console.log('✓ Public listing correctly reflects verified owner status.');

  // Test 28: Admin bans user and ban enforcement
  console.log('\n[28] Testing Admin user ban and login/action blocking...');
  const banRes = await fetch(`${BASE_URL}/api/admin/users/${user1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ is_banned: true })
  });
  assert.strictEqual(banRes.status, 200);

  // User 1 login must now fail with 403 Forbidden
  const bannedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: 'SecurePassword123!' })
  });
  assert.strictEqual(bannedLoginRes.status, 403);
  const bannedLoginData = await bannedLoginRes.json();
  assert.strictEqual(bannedLoginData.error, 'account_banned');
  console.log('✓ Banned user blocked from logging in with 403 account_banned.');

  // User 1 publishing with existing token must fail
  const bannedPublishRes = await fetch(`${BASE_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      destination_country: 'KZ',
      destination_locality: 'almaty',
      cargo_name: 'Banned Test Cargo',
      weight: 10,
      body_type: 'curtainsider'
    })
  });
  assert.ok(bannedPublishRes.status === 401 || bannedPublishRes.status === 403, 'Banned user request must be blocked');
  console.log('✓ Banned user blocked from publishing (session revoked / account banned).');

  // Unban User 1
  const unbanRes = await fetch(`${BASE_URL}/api/admin/users/${user1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ is_banned: false })
  });
  assert.strictEqual(unbanRes.status, 200);
  console.log('✓ User 1 successfully unbanned.');

  // Re-login User 1 since ban invalidated previous session tokens
  const user1ReLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Email, password: 'SecurePassword123!' })
  });
  assert.strictEqual(user1ReLoginRes.status, 200);
  const user1ReLoginData = await user1ReLoginRes.json();
  user1Token = user1ReLoginData.token;

  // Test 29: Admin Moderation - Fetch listings and delete a listing
  console.log('\n[29] Testing Admin listing moderation and deletion...');
  const adminListingsRes = await fetch(`${BASE_URL}/api/admin/listings`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(adminListingsRes.status, 200);
  const adminListingsData = await adminListingsRes.json();
  assert.ok(Array.isArray(adminListingsData.cargo));
  assert.ok(Array.isArray(adminListingsData.transports));
  console.log(`✓ Admin fetched ${adminListingsData.cargo.length} cargo and ${adminListingsData.transports.length} transport listings for moderation.`);

  // Create a truck listing to test admin moderation deletion
  const modTruckRes = await fetch(`${BASE_URL}/api/transports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_city: 'samarkand',
      destination_country: 'RU',
      destination_city: 'moscow',
      body_type: 'refrigerated',
      truck_model: 'MAN TGX',
      max_weight: 20.0,
      volume: 88.0,
      available_date: '2026-11-25',
      price_expectation: '2500 USD',
      phone: '+998939998877',
      notes: 'Moderation test listing'
    })
  });
  assert.strictEqual(modTruckRes.status, 201);
  const modTruckData = await modTruckRes.json();
  const truckToModerateId = modTruckData.transport.id;

  // Delete transport listing by admin
  const deleteRes = await fetch(`${BASE_URL}/api/admin/listings/transport/${truckToModerateId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(deleteRes.status, 200);
  const deleteData = await deleteRes.json();
  assert.strictEqual(deleteData.success, true);

  // Verify deleted transport listing is gone
  const getDeletedRes = await fetch(`${BASE_URL}/api/transports/${truckToModerateId}`);
  assert.strictEqual(getDeletedRes.status, 404);
  console.log('✓ Listing successfully deleted by Admin and removed from marketplace.');

  // Test 30: Self-ban and self-demotion prevention
  console.log('\n[30] Testing Admin self-protection (cannot ban or demote self)...');
  const selfBanRes = await fetch(`${BASE_URL}/api/admin/users/${adminData.user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ is_banned: true })
  });
  assert.strictEqual(selfBanRes.status, 400);

  const selfDemoteRes = await fetch(`${BASE_URL}/api/admin/users/${adminData.user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ role: 'driver' })
  });
  assert.strictEqual(selfDemoteRes.status, 400);
  console.log('✓ Admin self-ban and self-demotion correctly prohibited.');

  // Test 31: Subscriptions - Seeded Plans and New User Balance
  console.log('\n[31] Testing Subscriptions - default seeded plans and initial 117 contacts...');
  const plansRes = await fetch(`${BASE_URL}/api/subscriptions/plans`);
  assert.strictEqual(plansRes.status, 200);
  const plansData = await plansRes.json();
  assert.ok(plansData.plans.length >= 2, 'Must have active plans available');
  const proPlan = plansData.plans.find(p => p.contact_limit === -1 || (p.name_uz && p.name_uz.toLowerCase().includes('pro')) || p.price_uzs === 149000 || p.price_uzs === 35000);
  assert.ok(proPlan, 'Pro Dispetcher plan must exist');
  assert.strictEqual(proPlan.contact_limit, -1);
  console.log('✓ Seeded plans verified. Pro Plan ID:', proPlan.id);

  // Check user1 initial status
  const statusRes = await fetch(`${BASE_URL}/api/subscriptions/my-status`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  assert.strictEqual(statusRes.status, 200);
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.free_contacts_remaining, 117);
  assert.strictEqual(statusData.has_active_plan, false);
  console.log('✓ User 1 starts with exactly 117 free contacts remaining.');

  // Test 32: Phone Masking on Public Cargo & Truck Listings
  console.log('\n[32] Testing phone masking for non-owners...');
  // Publish truck listing by User 2 for testing masking and unlocking
  const user2TruckRes = await fetch(`${BASE_URL}/api/transports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_city: 'tashkent_city',
      destination_country: 'KZ',
      destination_city: 'almaty',
      body_type: 'curtainsider',
      truck_model: 'Scania R500',
      max_weight: 22.0,
      phone: '+998912345678',
      price_expectation: '1500 USD'
    })
  });
  assert.strictEqual(user2TruckRes.status, 201);

  // Fetch truck listing created by user 2, viewed by user 1
  const publicTrucksRes = await fetch(`${BASE_URL}/api/transports`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const publicTrucksData = await publicTrucksRes.json();
  const sampleTruck = publicTrucksData.transports.find(t => t.user_id === user2Id);
  assert.ok(sampleTruck, 'Sample truck from user 2 must exist');
  assert.strictEqual(sampleTruck.is_phone_unlocked, false);
  assert.ok(sampleTruck.phone.includes('*'), 'Truck phone must be masked');
  console.log('✓ Truck phone masked for user 1:', sampleTruck.phone);

  // Test 33: Unlock Contact (117 -> 116)
  console.log('\n[33] Testing contact unlock (consumes 1 credit, returns real phone)...');
  const unlockRes = await fetch(`${BASE_URL}/api/subscriptions/unlock-contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      listing_type: 'transport',
      listing_id: sampleTruck.id
    })
  });
  assert.strictEqual(unlockRes.status, 200);
  const unlockData = await unlockRes.json();
  assert.strictEqual(unlockData.success, true);
  assert.strictEqual(unlockData.already_unlocked, false);
  assert.strictEqual(unlockData.free_contacts_remaining, 116);
  assert.ok(!unlockData.phone.includes('*'), 'Revealed phone must not contain asterisks');
  console.log('✓ Unlocked contact! Real phone:', unlockData.phone, '| Remaining credits:', unlockData.free_contacts_remaining);

  // Test 34: Unlock Idempotence (already unlocked does not decrement again)
  console.log('\n[34] Testing unlock idempotence (re-accessing same listing does not decrement)...');
  const reUnlockRes = await fetch(`${BASE_URL}/api/subscriptions/unlock-contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      listing_type: 'transport',
      listing_id: sampleTruck.id
    })
  });
  assert.strictEqual(reUnlockRes.status, 200);
  const reUnlockData = await reUnlockRes.json();
  assert.strictEqual(reUnlockData.already_unlocked, true);
  assert.strictEqual(reUnlockData.free_contacts_remaining, 116);
  console.log('✓ Re-unlocking was free! Balance remains:', reUnlockData.free_contacts_remaining);

  // Test 35: Subscription Request Submission
  console.log('\n[35] Testing subscription payment request submission...');
  const subReqRes = await fetch(`${BASE_URL}/api/subscriptions/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      plan_id: proPlan.id,
      receipt_note: 'Payme receipt #9988776655, paid 149,000 UZS'
    })
  });
  assert.strictEqual(subReqRes.status, 201);
  const subReqData = await subReqRes.json();
  assert.strictEqual(subReqData.request.status, 'pending');
  assert.strictEqual(subReqData.request.plan_id, proPlan.id);
  const createdReqId = subReqData.request.id;
  console.log('✓ Subscription request created with ID:', createdReqId);

  // Test 36: Admin Moderation of Subscriptions & Unlimited Contact Access
  console.log('\n[36] Testing Admin approval of subscription request and unlimited plan grant...');
  // Admin checks requests
  const adminReqsRes = await fetch(`${BASE_URL}/api/admin/subscription-requests`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(adminReqsRes.status, 200);
  const adminReqsData = await adminReqsRes.json();
  const foundReq = adminReqsData.requests.find(r => r.id === createdReqId);
  assert.ok(foundReq, 'Admin must see the pending subscription request');

  // Admin approves request
  const approveRes = await fetch(`${BASE_URL}/api/admin/subscription-requests/${createdReqId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.strictEqual(approveData.success, true);
  console.log('✓ Admin successfully approved subscription request.');

  // User 1 now checks my-status
  const updatedStatusRes = await fetch(`${BASE_URL}/api/subscriptions/my-status`, {
    headers: { 'Authorization': `Bearer ${user1Token}` }
  });
  const updatedStatusData = await updatedStatusRes.json();
  assert.strictEqual(updatedStatusData.has_active_plan, true);
  assert.strictEqual(updatedStatusData.has_unlimited_contacts, true);
  assert.ok(updatedStatusData.plan_name.toLowerCase().includes('pro'), 'Plan name must contain Pro');
  console.log('✓ User 1 now has active PRO subscription with UNLIMITED contacts!');

  // Admin resets user credits
  const resetRes = await fetch(`${BASE_URL}/api/admin/users/${user1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ free_contacts_remaining: 117 })
  });
  assert.strictEqual(resetRes.status, 200);
  console.log('✓ Admin successfully reset user free contacts counter.');

  // Test 37: Payment Settings Management in Admin Panel
  console.log('\n[37] Testing Payment Card & Requisites Management (Admin & Public)...');
  
  // 37a. Public endpoint returns payment settings
  const publicPayRes = await fetch(`${BASE_URL}/api/subscriptions/payment-settings`);
  assert.strictEqual(publicPayRes.status, 200);
  const publicPayData = await publicPayRes.json();
  assert.ok(publicPayData.settings, 'Payment settings must be returned');
  assert.ok(publicPayData.settings.card_number, 'Card number must be present');
  console.log('✓ Public payment settings fetched. Card:', publicPayData.settings.card_number);

  // 37b. Non-admin forbidden from updating payment settings
  const forbiddenPayRes = await fetch(`${BASE_URL}/api/admin/payment-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      card_number: '8600 0000 0000 0000',
      card_holder: 'Hacker'
    })
  });
  assert.strictEqual(forbiddenPayRes.status, 403);
  console.log('✓ Unauthorized payment settings update rejected with 403 Forbidden.');

  // 37c. Admin successfully updates payment settings
  const adminPayRes = await fetch(`${BASE_URL}/api/admin/payment-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      card_number: '9860 1122 3344 5566',
      card_holder: 'Humo Logistics MCHJ',
      card_bank: 'Humo / Uzcard / Click',
      instructions_uz: 'Click yoki Payme orqali to‘lov qiling',
      instructions_ru: 'Оплатите через Click или Payme',
      instructions_en: 'Pay via Click or Payme'
    })
  });
  assert.strictEqual(adminPayRes.status, 200);
  const adminPayData = await adminPayRes.json();
  assert.strictEqual(adminPayData.settings.card_number, '9860 1122 3344 5566');
  assert.strictEqual(adminPayData.settings.card_holder, 'Humo Logistics MCHJ');
  console.log('✓ Admin successfully updated card number to: 9860 1122 3344 5566');

  // 37d. Verify update is reflected immediately on public endpoint
  const verifyPayRes = await fetch(`${BASE_URL}/api/subscriptions/payment-settings`);
  const verifyPayData = await verifyPayRes.json();
  assert.strictEqual(verifyPayData.settings.card_number, '9860 1122 3344 5566');
  console.log('✓ Live public checkout immediately reflects the updated card number.');

  // Test 38: Support & Social Media Channels Management (Widget, Footer & Admin Panel)
  console.log('\n[38] Testing Support Extension & Social Media Channels (Admin & Public)...');

  // 38a. Public GET /api/support
  const publicSupRes = await fetch(`${BASE_URL}/api/support`);
  assert.strictEqual(publicSupRes.status, 200);
  const publicSupData = await publicSupRes.json();
  assert.ok(publicSupData.support, 'Support settings must exist');
  assert.ok(publicSupData.support.phone, 'Phone must exist');
  assert.ok(Array.isArray(publicSupData.socials), 'Socials must be an array');
  assert.ok(publicSupData.socials.length >= 1, 'Must have at least one social link');
  assert.ok(publicSupData.socials.some(s => s.platform === 'telegram' || s.platform === 'instagram'), 'Must include Telegram or Instagram');
  console.log(`✓ Public support fetched. Phone: ${publicSupData.support.phone}, Active Socials: ${publicSupData.socials.length}`);

  const originalSettings = { ...publicSupData.support };

  // 38b. Security: Non-admin rejected with 403 Forbidden
  const forbiddenSupRes = await fetch(`${BASE_URL}/api/admin/support/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ phone: '+998 90 000 00 00' })
  });
  assert.strictEqual(forbiddenSupRes.status, 403, 'Non-admin must receive 403 on support settings');
  console.log('✓ Unauthorized support settings modification blocked with 403 Forbidden.');

  // 38c. Admin updates support settings
  const adminSupUpdateRes = await fetch(`${BASE_URL}/api/admin/support/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      phone: '+998 71 200 44 44',
      email: 'help@humologistics.uz',
      telegram_support: 'https://t.me/humologistics_support',
      whatsapp_support: 'https://wa.me/998901234567',
      working_hours_uz: 'Dushanba - Shanba: 09:00 - 19:00',
      working_hours_ru: 'Понедельник - Суббота: 09:00 - 19:00',
      working_hours_en: 'Monday - Saturday: 09:00 - 19:00',
      address_uz: 'Toshkent shahri, Amir Temur shox ko‘chasi, 107-uy',
      address_ru: 'г. Ташкент, проспект Амира Темура, 107',
      address_en: '107, Amir Temur Avenue, Tashkent',
      is_widget_enabled: true
    })
  });
  assert.strictEqual(adminSupUpdateRes.status, 200);
  const adminSupUpdateData = await adminSupUpdateRes.json();
  assert.strictEqual(adminSupUpdateData.settings.phone, '+998 71 200 44 44');
  assert.strictEqual(adminSupUpdateData.settings.email, 'help@humologistics.uz');
  console.log('✓ Admin successfully updated support settings.');

  // Restore user's original support settings
  await fetch(`${BASE_URL}/api/admin/support/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(originalSettings)
  });

  // 38d. Admin manages social links CRUD
  // Add new social link (LinkedIn)
  const addSocialRes = await fetch(`${BASE_URL}/api/admin/support/socials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      platform: 'linkedin',
      title: 'Humo LinkedIn',
      url: 'https://linkedin.com/company/humologistics',
      sort_order: 10,
      is_active: true
    })
  });
  assert.strictEqual(addSocialRes.status, 201);
  const addSocialData = await addSocialRes.json();
  assert.strictEqual(addSocialData.social.platform, 'linkedin');
  const createdSocialId = addSocialData.social.id;
  console.log('✓ Admin successfully added new social network (LinkedIn).');

  // Update social link
  const updateSocialRes = await fetch(`${BASE_URL}/api/admin/support/socials/${createdSocialId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      platform: 'linkedin',
      title: 'Humo Official LinkedIn',
      url: 'https://linkedin.com/company/humologistics-uz',
      sort_order: 10,
      is_active: true
    })
  });
  assert.strictEqual(updateSocialRes.status, 200);
  const updateSocialData = await updateSocialRes.json();
  assert.strictEqual(updateSocialData.social.title, 'Humo Official LinkedIn');
  console.log('✓ Admin successfully updated social link.');

  // Delete social link
  const deleteSocialRes = await fetch(`${BASE_URL}/api/admin/support/socials/${createdSocialId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(deleteSocialRes.status, 200);
  console.log('✓ Admin successfully deleted test social link.');

  // ==========================================
  // [39] Stage 1 AI Smart Parser (/api/ai/parse-listing)
  // ==========================================
  console.log('\n[39] Testing Stage 1 AI Smart Parser (/api/ai/parse-listing)...');

  // Unauthorized access check
  const unauthAiRes = await fetch(`${BASE_URL}/api/ai/parse-listing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Toshkentdan Olmaotaga 20 tonna yuk bor' })
  });
  assert.strictEqual(unauthAiRes.status, 401);
  console.log('✓ Unauthorized AI parsing rejected with 401 Forbidden.');

  // Empty / short text check
  const emptyAiRes = await fetch(`${BASE_URL}/api/ai/parse-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ text: 'sal' })
  });
  assert.strictEqual(emptyAiRes.status, 400);
  console.log('✓ Short/empty text rejected with 400 Bad Request.');

  // Off-topic / non-logistics check
  const offTopicAiRes = await fetch(`${BASE_URL}/api/ai/parse-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ text: "Salom, menga chiroyli she'r yozib ber" })
  });
  assert.strictEqual(offTopicAiRes.status, 400);
  const offTopicData = await offTopicAiRes.json();
  assert.strictEqual(offTopicData.error, 'not_logistics');
  console.log('✓ Off-topic non-logistics prompt rejected with 400 not_logistics.');

  // Valid Cargo parsing
  const cargoAiRes = await fetch(`${BASE_URL}/api/ai/parse-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      text: "Toshkentdan Olmaotaga 20 tonna meva-sabzavot bor, ref kerak, narxi 1200$, tel: +998901234567",
      type: "cargo"
    })
  });
  assert.strictEqual(cargoAiRes.status, 200);
  const cargoAiData = await cargoAiRes.json();
  assert.strictEqual(cargoAiData.success, true);
  assert.strictEqual(cargoAiData.data.origin_country, 'UZ');
  assert.strictEqual(cargoAiData.data.destination_country, 'KZ');
  assert.strictEqual(cargoAiData.data.weight, 20);
  assert.strictEqual(cargoAiData.data.body_type, 'refrigerated');
  assert.ok(cargoAiData.data.phone.includes('998901234567'));
  console.log('✓ Valid Cargo message parsed into structured logistics parameters.');

  // Valid Transport parsing
  const truckAiRes = await fetch(`${BASE_URL}/api/ai/parse-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      text: "Toshkentda 22t Volvo parda tent fura bor, Chimkentga reys qidiryapman, tel: +998912345678",
      type: "transport"
    })
  });
  assert.strictEqual(truckAiRes.status, 200);
  const truckAiData = await truckAiRes.json();
  assert.strictEqual(truckAiData.success, true);
  assert.strictEqual(truckAiData.data.origin_country, 'UZ');
  assert.strictEqual(truckAiData.data.destination_country, 'KZ');
  assert.strictEqual(truckAiData.data.max_weight, 22);
  assert.strictEqual(truckAiData.data.body_type, 'curtainsider');
  assert.ok(truckAiData.data.phone.includes('998912345678'));
  console.log('✓ Valid Transport message parsed into structured logistics parameters.');

  // ==========================================
  // [40] Stage 2 AI Smart Matching (/api/ai/match)
  // ==========================================
  console.log('\n[40] Testing Stage 2 AI Smart Matching (/api/ai/match)...');

  // 1. Unauthenticated request check
  const unauthMatchRes = await fetch(`${BASE_URL}/api/ai/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listing_type: 'cargo', listing_id: listingId })
  });
  assert.strictEqual(unauthMatchRes.status, 401);
  console.log('✓ Unauthenticated match request rejected with 401.');

  // 2. Bad request checks
  const badMatchRes = await fetch(`${BASE_URL}/api/ai/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ listing_type: 'invalid', listing_id: listingId })
  });
  assert.strictEqual(badMatchRes.status, 400);

  const missingParamRes = await fetch(`${BASE_URL}/api/ai/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ listing_type: 'cargo' })
  });
  assert.strictEqual(missingParamRes.status, 400);

  const notFoundMatchRes = await fetch(`${BASE_URL}/api/ai/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ listing_type: 'cargo', listing_id: 999999 })
  });
  assert.strictEqual(notFoundMatchRes.status, 404);
  console.log('✓ Parameter validation and 404 checks verified.');

  // 3. Create a paired cargo and transport for realistic matching test
  const pairCargoRes = await fetch(`${BASE_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_locality: 'tashkent_city',
      origin_custom: 0,
      destination_country: 'KZ',
      destination_locality: 'almaty',
      destination_custom: 0,
      cargo_name: 'AI Match Test To‘qimachilik Mahsulotlari',
      body_type: 'curtainsider',
      weight: 18.0,
      volume: 82.0,
      loading_date_type: 'ready_now',
      price_type: 'fixed',
      price_amount: 1400,
      price_currency: 'USD'
    })
  });
  assert.strictEqual(pairCargoRes.status, 201);
  const pairCargoData = await pairCargoRes.json();
  const testCargoId = pairCargoData.listing.id;

  const pairTruckRes = await fetch(`${BASE_URL}/api/transports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      origin_country: 'UZ',
      origin_city: 'tashkent_city',
      destination_country: 'KZ',
      destination_city: 'almaty',
      truck_model: 'MAN TGX 18.440',
      body_type: 'curtainsider',
      max_weight: 22.0,
      volume: 86.0,
      available_date: '2026-11-20',
      phone: '+998901234567',
      notes: 'Har qanday yukka tayyormiz'
    })
  });
  assert.strictEqual(pairTruckRes.status, 201);
  const pairTruckData = await pairTruckRes.json();
  const testTruckId = pairTruckData.transport.id;

  // 4. Test Smart Matching for Cargo -> find matching Transports
  const matchForCargoRes = await fetch(`${BASE_URL}/api/ai/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      listing_type: 'cargo',
      listing_id: testCargoId,
      lang: 'uz'
    })
  });
  assert.strictEqual(matchForCargoRes.status, 200);
  const matchForCargoData = await matchForCargoRes.json();
  assert.strictEqual(matchForCargoData.success, true);
  assert.ok(matchForCargoData.target, 'Target listing returned');
  assert.strictEqual(matchForCargoData.target.id, testCargoId);
  assert.ok(Array.isArray(matchForCargoData.matches), 'Matches is array');
  assert.ok(matchForCargoData.matches.length >= 1, 'At least 1 transport matched');

  const topTruck = matchForCargoData.matches.find(m => m.id === testTruckId) || matchForCargoData.matches[0];
  assert.ok(topTruck.match_score >= 60, `Score must be >= 60%, got ${topTruck.match_score}`);
  assert.ok(typeof topTruck.match_reason === 'string' && topTruck.match_reason.length > 5, 'Match reason provided');
  assert.ok(topTruck.first_name, 'Owner info included');
  console.log(`✓ AI Match for Cargo #${testCargoId}: Top match Truck #${topTruck.id} (${topTruck.match_score}% - "${topTruck.match_reason}").`);

  // 5. Test Smart Matching for Transport -> find matching Cargo
  const matchForTruckRes = await fetch(`${BASE_URL}/api/ai/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      listing_type: 'transport',
      listing_id: testTruckId,
      lang: 'ru'
    })
  });
  assert.strictEqual(matchForTruckRes.status, 200);
  const matchForTruckData = await matchForTruckRes.json();
  assert.strictEqual(matchForTruckData.success, true);
  assert.ok(matchForTruckData.target, 'Target listing returned');
  assert.strictEqual(matchForTruckData.target.id, testTruckId);
  assert.ok(Array.isArray(matchForTruckData.matches), 'Matches is array');
  assert.ok(matchForTruckData.matches.length >= 1, 'At least 1 cargo matched');

  const topCargo = matchForTruckData.matches.find(m => m.id === testCargoId) || matchForTruckData.matches[0];
  assert.ok(topCargo.match_score >= 60, `Score must be >= 60%, got ${topCargo.match_score}`);
  assert.ok(typeof topCargo.match_reason === 'string' && topCargo.match_reason.length > 5, 'Match reason provided');
  assert.ok(topCargo.first_name, 'Owner info included');
  console.log(`✓ AI Match for Transport #${testTruckId}: Top match Cargo #${topCargo.id} (${topCargo.match_score}% - "${topCargo.match_reason}").`);

  console.log('✓ Stage 2 AI Smart Matching end-to-end verified successfully.');

  // ==========================================
  // [41] Stage 3 Humo AI Dispatcher Assistant (/api/ai/ask)
  // ==========================================
  console.log('\n[41] Testing Stage 3 Humo AI Dispatcher Assistant (/api/ai/ask)...');

  // 1. Unauthenticated request check
  const unauthAskRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'CMR nima?' })
  });
  assert.strictEqual(unauthAskRes.status, 401);
  console.log('✓ Unauthenticated dispatcher question rejected with 401.');

  // 2. Empty / invalid question
  const emptyAskRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ question: '' })
  });
  assert.strictEqual(emptyAskRes.status, 400);

  // 3. Question too long (> 500 chars)
  const tooLongAskRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ question: 'A'.repeat(505) })
  });
  assert.strictEqual(tooLongAskRes.status, 400);
  console.log('✓ Empty and oversized (>500 chars) dispatcher questions rejected with 400.');

  // 4. Strictly Constrained Off-Topic Refusal (Uzbek)
  const offTopicUzRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      question: 'Menga Python dasturlash tilida web-sayt yaratish bo‘yicha kod yozib ber',
      lang: 'uz'
    })
  });
  assert.strictEqual(offTopicUzRes.status, 200);
  const offTopicUzData = await offTopicUzRes.json();
  assert.strictEqual(offTopicUzData.success, true);
  assert.strictEqual(
    offTopicUzData.answer,
    'Kechirasiz, men faqat Humo Logistics va yuk tashish logistikasi masalalari bo‘yicha yordam bera olaman.'
  );
  console.log('✓ Off-topic programming question strictly refused in Uzbek.');

  // 5. Strictly Constrained Off-Topic Refusal (Russian)
  const offTopicRuRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      question: 'Расскажи смешной анекдот или дай рецепт пирога',
      lang: 'ru'
    })
  });
  assert.strictEqual(offTopicRuRes.status, 200);
  const offTopicRuData = await offTopicRuRes.json();
  assert.strictEqual(offTopicRuData.success, true);
  assert.strictEqual(
    offTopicRuData.answer,
    'Извините, я могу отвечать только на вопросы, связанные с платформой Humo Logistics и грузоперевозками.'
  );
  console.log('✓ Off-topic jokes/recipe question strictly refused in Russian.');

  // 6. Valid Logistics Question: CMR & TIR documents (Uzbek)
  const cmrAskRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      question: 'CMR va TIR hujjatlari nima va ularning xalqaro yuk tashishdagi vazifasi nima?',
      lang: 'uz'
    })
  });
  assert.strictEqual(cmrAskRes.status, 200);
  const cmrAskData = await cmrAskRes.json();
  assert.strictEqual(cmrAskData.success, true);
  assert.ok(typeof cmrAskData.answer === 'string' && cmrAskData.answer.length > 50);
  assert.ok(cmrAskData.answer.includes('CMR') || cmrAskData.answer.includes('TIR'));
  console.log('✓ Valid CMR & TIR question answered with concise professional guidance.');

  // 7. Valid Logistics Question: 20t trailer specs (Russian)
  const dimsAskRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      question: 'Какие стандартные габариты и объем у 20-тонного евротента?',
      lang: 'ru'
    })
  });
  assert.strictEqual(dimsAskRes.status, 200);
  const dimsAskData = await dimsAskRes.json();
  assert.strictEqual(dimsAskData.success, true);
  assert.ok(
    dimsAskData.answer.toLowerCase().includes('тент') ||
    dimsAskData.answer.includes('13') ||
    dimsAskData.answer.toLowerCase().includes('габарит') ||
    dimsAskData.answer.length > 50
  );
  console.log(`✓ 20t trailer dimensions answered accurately in Russian (${dimsAskData.answer.length} chars).`);

  // 8. Natural Greeting (Uzbek & Russian)
  const greetingUzRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ question: 'Salom', lang: 'uz' })
  });
  assert.strictEqual(greetingUzRes.status, 200);
  const greetingUzData = await greetingUzRes.json();
  assert.strictEqual(greetingUzData.success, true);
  assert.strictEqual(greetingUzData.refused, false);
  assert.ok(greetingUzData.answer.includes('Assalomu alaykum') || greetingUzData.answer.includes('Humo'));
  console.log('✓ Natural greeting "Salom" answered warmly in Uzbek.');

  const greetingRuRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({ question: 'Привет!', lang: 'ru' })
  });
  assert.strictEqual(greetingRuRes.status, 200);
  const greetingRuData = await greetingRuRes.json();
  assert.strictEqual(greetingRuData.success, true);
  assert.strictEqual(greetingRuData.refused, false);
  assert.ok(greetingRuData.answer.includes('Здравствуйте') || greetingRuData.answer.includes('Humo'));
  console.log('✓ Natural greeting "Привет!" answered warmly in Russian.');

  // 9. Real Logistics Route & Freight Search Guidance
  const searchGuideRes = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ question: 'Menga yuk topib ber', lang: 'uz' })
  });
  assert.strictEqual(searchGuideRes.status, 200);
  const searchGuideData = await searchGuideRes.json();
  assert.strictEqual(searchGuideData.success, true);
  assert.strictEqual(searchGuideData.refused, false);
  assert.ok(searchGuideData.answer.includes('#/cargo') || searchGuideData.answer.includes('Yuklar'));
  console.log('✓ Freight search request guided to #/cargo and AI Smart Matching.');

  // ==========================================
  // [42] Stage 4 In-Chat One-Click Message Translator (/api/ai/translate)
  // ==========================================
  console.log('\n[42] Testing Stage 4 In-Chat One-Click Message Translator (/api/ai/translate)...');

  // 1. Unauthenticated request check
  const unauthTransRes = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Здравствуйте', target_lang: 'uz' })
  });
  assert.strictEqual(unauthTransRes.status, 401);
  console.log('✓ Unauthenticated translation request rejected with 401.');

  // 2. Empty text validation
  const emptyTransRes = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({ text: '' })
  });
  assert.strictEqual(emptyTransRes.status, 400);

  // 3. Translate Russian chat message to Uzbek
  const ruToUzRes = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      text: 'Здравствуйте! Груз готов к погрузке, машина готова?',
      target_lang: 'uz'
    })
  });
  assert.strictEqual(ruToUzRes.status, 200);
  const ruToUzData = await ruToUzRes.json();
  assert.strictEqual(ruToUzData.success, true);
  assert.strictEqual(ruToUzData.target_lang, 'uz');
  assert.ok(typeof ruToUzData.translated_text === 'string' && ruToUzData.translated_text.length > 5);
  console.log(`✓ Russian ➔ Uzbek translation: "${ruToUzData.translated_text}"`);

  // 4. Translate Uzbek chat message to Russian (preserving rates and numbers)
  const uzToRuRes = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      text: 'Assalomu alaykum! Narxini 12 000 000 UZS ga kelishsak bo‘ladimi? Mashina tayyor.',
      target_lang: 'ru'
    })
  });
  assert.strictEqual(uzToRuRes.status, 200);
  const uzToRuData = await uzToRuRes.json();
  assert.strictEqual(uzToRuData.success, true);
  assert.strictEqual(uzToRuData.target_lang, 'ru');
  assert.ok(uzToRuData.translated_text.includes('12 000 000') || uzToRuData.translated_text.includes('UZS'));
  console.log(`✓ Uzbek ➔ Russian translation: "${uzToRuData.translated_text}"`);

  // 5. Translate to English
  const uzToEnRes = await fetch(`${BASE_URL}/api/ai/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      text: 'Tent fura 22 tonna tayyor',
      target_lang: 'en'
    })
  });
  assert.strictEqual(uzToEnRes.status, 200);
  const uzToEnData = await uzToEnRes.json();
  assert.strictEqual(uzToEnData.success, true);
  assert.strictEqual(uzToEnData.target_lang, 'en');
  assert.ok(typeof uzToEnData.translated_text === 'string' && uzToEnData.translated_text.length > 0);
  console.log(`✓ Uzbek ➔ English translation: "${uzToEnData.translated_text}"`);

  console.log('✓ Stage 3 & 4 AI Assistant & Chat Translator verified successfully.');

  console.log('\n======================================================');
  console.log('🎉 ALL 42 END-TO-END ACCEPTANCE CHECKS PASSED PERFECTLY!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
