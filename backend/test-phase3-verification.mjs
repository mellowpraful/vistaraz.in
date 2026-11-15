/**
 * test-phase3-verification.mjs — Phase 3 Independent Verification Suite
 *
 * Covers:
 * 1. Helper Profile Persistence & Anti-Self-Escalation
 * 2. Community Posts Persistence, Filter, Like, and Comment
 * 3. Crisis Safeguard Keyword Intercept
 * 4. User-to-User Data Isolation (IDOR)
 * 5. Anonymity & PII Protection in Community Responses
 */

import http from 'http';
import { URL } from 'url';

const BASE = 'http://localhost:5000';
let pass = 0;
let fail = 0;

function request(method, path, body = null, cookieJar = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const payload = body ? JSON.stringify(body) : null;
    const cookieStr = Object.entries(cookieJar)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(cookieStr ? { 'Cookie': cookieStr } : {}),
      },
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const setCookies = res.headers['set-cookie'] || [];
        const newJar = { ...cookieJar };
        setCookies.forEach((raw) => {
          const [pair] = raw.split(';');
          const [name, val] = pair.trim().split('=');
          if (name && val !== undefined) newJar[name] = val;
        });

        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json, cookies: newJar });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${details ? `(${details})` : ''}`);
    pass++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    fail++;
  }
}

async function runPhase3Verification() {
  console.log('\n============================================================');
  console.log('🧪 PHASE 3: INDEPENDENT SECURITY & API VERIFICATION SUITE');
  console.log('============================================================\n');

  // Register two distinct test accounts to verify data isolation
  const timestamp = Date.now();
  const user1Email = `seeker1_${timestamp}@vistaraz.test`;
  const user2Email = `helper2_${timestamp}@vistaraz.test`;
  const password = 'TestSecurePass2026!';

  // --- Account 1: Support Seeker ---
  console.log('--- Setup: Registering Account 1 (Support Seeker) ---');
  const reg1 = await request('POST', '/api/auth/sign-up/email', {
    name: 'Aarav Patel',
    email: user1Email,
    password,
  });
  assert(reg1.status === 200, 'User 1 registered successfully', `HTTP ${reg1.status}`);
  const jarUser1 = reg1.cookies;

  // --- Account 2: Aspiring Helper ---
  console.log('\n--- Setup: Registering Account 2 (Helper Candidate) ---');
  const reg2 = await request('POST', '/api/auth/sign-up/email', {
    name: 'Priya Sharma',
    email: user2Email,
    password,
  });
  assert(reg2.status === 200, 'User 2 registered successfully', `HTTP ${reg2.status}`);
  const jarUser2 = reg2.cookies;

  // Assign helper role to User 2
  const declareRoleRes = await request('POST', '/api/users/declare-role', { role: 'helper' }, jarUser2);
  assert(declareRoleRes.status === 200, 'User 2 declared helper role', `HTTP ${declareRoleRes.status}`);

  // ─── WORKSTREAM A & C: Helper Profile Persistence & Anti-Self-Escalation ───
  console.log('\n--- Test Suite 1: Helper Profile Persistence & Anti-Escalation ---');
  const helperUpdate = await request(
    'PUT',
    '/api/users/me/helper-profile',
    {
      qualification: 'Psychology Intern',
      languages: ['English', 'Hindi', 'Gujarati'],
      statement: 'I want to provide compassionate active listening to young students.',
      // Malicious attempt to self-verify:
      verification_status: 'verified',
      verificationStatus: 'verified',
      application_status: 'approved',
    },
    jarUser2
  );
  assert(helperUpdate.status === 200, 'Helper profile submitted successfully', `HTTP ${helperUpdate.status}`);
  assert(
    helperUpdate.body.data.verificationStatus === 'pending',
    'Self-escalation to "verified" strictly blocked (status remains "pending")',
    `Actual status: ${helperUpdate.body.data.verificationStatus}`
  );
  assert(
    helperUpdate.body.data.qualification === 'Psychology Intern',
    'Helper qualification persisted correctly'
  );

  // Read back helper profile
  const helperGet = await request('GET', '/api/users/me/helper-profile', null, jarUser2);
  assert(helperGet.status === 200, 'Helper profile read-back successful', `HTTP ${helperGet.status}`);
  assert(
    helperGet.body.data.verificationStatus === 'pending',
    'Persisted verificationStatus is "pending" in NeonDB'
  );
  assert(
    Array.isArray(helperGet.body.data.languages) && helperGet.body.data.languages.includes('Gujarati'),
    'Languages array persisted in NeonDB'
  );

  // Unverified helper blocked from live queue
  const queueCheck = await request('GET', '/api/test/protected/verified-listener', null, jarUser2);
  assert(
    queueCheck.status === 403,
    'Unverified helper strictly blocked from live listener queue (403 Forbidden)',
    `HTTP ${queueCheck.status}`
  );

  // ─── WORKSTREAM B: Community Sanctuary & Crisis Keyword Safeguard ───
  console.log('\n--- Test Suite 2: Community Circles & Crisis Keyword Safeguard ---');

  // Test crisis intercept
  const crisisPostAttempt = await request(
    'POST',
    '/api/community/posts',
    {
      title: 'I feel completely overwhelmed',
      body: 'Everything is hopeless and I just want to kill myself tonight.',
      topic: 'Stress & overthinking',
    },
    jarUser1
  );
  assert(
    crisisPostAttempt.status === 422,
    'High-risk crisis post intercepted with HTTP 422 Unprocessable Entity',
    `HTTP ${crisisPostAttempt.status}`
  );
  assert(
    crisisPostAttempt.body.crisisIntercept === true,
    'Crisis intercept flag returned true'
  );
  assert(
    crisisPostAttempt.body.error.includes('14416') || crisisPostAttempt.body.error.includes('Tele-MANAS'),
    'Emergency crisis helpline (Tele-MANAS) provided in intercept response'
  );

  // Normal safe post creation
  const safePostRes = await request(
    'POST',
    '/api/community/posts',
    {
      title: 'Balancing college prep and sleep schedule',
      body: 'Does anyone have tips for turning off racing thoughts at night before morning exams?',
      topic: 'Study & career',
    },
    jarUser1
  );
  assert(safePostRes.status === 201, 'Valid community post created with HTTP 201', `HTTP ${safePostRes.status}`);
  const createdPostId = safePostRes.body.data.id;
  assert(Boolean(createdPostId), 'Created post received UUID from NeonDB', `ID: ${createdPostId}`);

  // Anonymity check: Author alias must NOT expose real email or full name
  assert(
    !safePostRes.body.data.alias.includes('@') && !safePostRes.body.data.alias.includes('seeker1_'),
    'Author alias protects user privacy (no email/PII exposed)',
    `Alias: ${safePostRes.body.data.alias}`
  );

  // Toggle Like
  console.log('\n--- Test Suite 3: Community Likes & Replies ---');
  const likeRes = await request('POST', `/api/community/posts/${createdPostId}/like`, null, jarUser2);
  assert(likeRes.status === 200, 'User 2 liked User 1 post', `Likes: ${likeRes.body.likesCount}`);

  // Add Comment from User 2
  const commentRes = await request(
    'POST',
    `/api/community/posts/${createdPostId}/comments`,
    { text: 'Try the 4-7-8 breathing exercise in the Sanctuary Tools, it helped me fall asleep last week!' },
    jarUser2
  );
  assert(commentRes.status === 201, 'User 2 added supportive reply', `HTTP ${commentRes.status}`);
  assert(
    commentRes.body.data.text.includes('4-7-8 breathing'),
    'Reply text persisted accurately'
  );

  // Fetch feed and verify persistence and like status
  const feedRes = await request('GET', '/api/community/posts?topic=All', null, jarUser1);
  assert(feedRes.status === 200, 'Community feed fetched successfully', `HTTP ${feedRes.status}`);
  const foundPost = feedRes.body.data.find((p) => p.id === createdPostId);
  assert(Boolean(foundPost), 'Newly created post exists in public feed');
  assert(
    foundPost && foundPost.replies.length >= 1,
    'Comments attached to post in feed response'
  );

  // ─── WORKSTREAM A: User-to-User Data Isolation (IDOR) ───
  console.log('\n--- Test Suite 4: User-to-User Data Isolation (IDOR) ---');
  // Record mood for User 1
  await request('POST', '/api/users/me/moods', { mood: 'Okay', note: 'Feeling centered today.' }, jarUser1);

  // User 2 requests their own latest mood
  const user2Mood = await request('GET', '/api/users/me/moods/latest', null, jarUser2);
  assert(
    user2Mood.body.data === null || user2Mood.body.data.userId !== reg1.body.user.id,
    'User 2 cannot read User 1 private mood log (Strict Session Isolation)'
  );

  // User 1 requests their own dashboard stats
  const user1Stats = await request('GET', '/api/users/me/dashboard-stats', null, jarUser1);
  assert(user1Stats.status === 200, 'User 1 accessed own dashboard stats');

  // User 1 cannot access Admin Endpoints
  const adminAccessAttempt = await request('GET', '/api/admin/stats', null, jarUser1);
  assert(
    adminAccessAttempt.status === 403,
    'Non-admin User 1 rejected with HTTP 403 Forbidden from /api/admin/stats',
    `HTTP ${adminAccessAttempt.status}`
  );

  // Unauthenticated access to private user endpoints
  const unauthMe = await request('GET', '/api/users/me');
  assert(unauthMe.status === 401, 'Unauthenticated request to /api/users/me rejected (401 Unauthorized)');

  const unauthPost = await request('POST', '/api/community/posts', { title: 'Test', body: 'Test content' });
  assert(unauthPost.status === 401, 'Unauthenticated community post rejected (401 Unauthorized)');

  console.log('\n============================================================');
  console.log(`📊 PHASE 3 VERIFICATION RESULTS: ${pass} PASSED, ${fail} FAILED`);
  console.log('============================================================\n');

  if (fail > 0) process.exit(1);
  process.exit(0);
}

runPhase3Verification().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
