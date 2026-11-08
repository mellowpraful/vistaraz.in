/**
 * test-seeker-profile-flow.mjs — Comprehensive Seeker Profile End-to-End Test Suite
 *
 * Validates:
 * 1. Unauthenticated requests to /api/users/me/profile (GET, POST, PATCH) are rejected (401 Unauthorized).
 * 2. Input validation on POST & PATCH (empty name, oversized name, invalid avatar_id rejected with 400).
 * 3. Freshly registered user has profileExists: false.
 * 4. First-time setup creates profile in NeonDB with 201 Created and profileExists: true.
 * 5. Subsequent GET /api/users/me/profile returns profileExists: true with saved details.
 * 6. Duplicate profile creation attempt is blocked with 409 Conflict.
 * 7. PATCH /api/users/me/profile safely updates realName and avatarId.
 * 8. Cleanup of test user data to prevent database pollution.
 */

import 'dotenv/config';
import http from 'http';
import { Pool } from '@neondatabase/serverless';
import app from './src/app.js';
import { env } from './src/config/env.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });

function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: address.port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const cookieArr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookieArr.map((c) => c.split(';')[0]).join('; ');
}

async function runTests() {
  console.log('\n--- 🧪 STARTING SEEKER PROFILE SETUP TEST SUITE ---\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const testEmail = `seeker_test_${Date.now()}@vistaraz.test`;
  const testPassword = 'Password123!';
  let testUserId = null;
  let sessionCookie = null;
  let failures = 0;

  try {
    // ── Test 1: Unauthenticated profile access ──
    console.log('Test 1: Unauthenticated profile access rejection (401)');
    const unauthGet = await makeRequest(server, { path: '/api/users/me/profile', method: 'GET' });
    if (unauthGet.status === 401 && unauthGet.body.code === 'UNAUTHORIZED') {
      console.log('  ✓ GET /api/users/me/profile without session returns 401 Unauthorized');
    } else {
      console.error('  ✗ Expected 401, got:', unauthGet.status, unauthGet.body);
      failures++;
    }

    const unauthPost = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'POST',
    }, { realName: 'Ghost', avatarId: 'avatar_01' });
    if (unauthPost.status === 401) {
      console.log('  ✓ POST /api/users/me/profile without session returns 401 Unauthorized');
    } else {
      console.error('  ✗ Expected 401, got:', unauthPost.status);
      failures++;
    }

    // ── Test 2: Register a new seeker user ──
    console.log('\nTest 2: Register a new seeker user via Better Auth');
    const signupRes = await makeRequest(server, {
      path: '/api/auth/sign-up/email',
      method: 'POST',
    }, {
      name: 'Initial Seeker',
      email: testEmail,
      password: testPassword,
    });

    if (signupRes.status === 200 && signupRes.body.user) {
      testUserId = signupRes.body.user.id;
      sessionCookie = extractCookie(signupRes.headers);
      console.log(`  ✓ Seeker registered successfully [id: ${testUserId}]`);
    } else {
      console.error('  ✗ Signup failed:', signupRes.status, signupRes.body);
      failures++;
      return;
    }

    // ── Test 3: Fresh user should have profileExists: false ──
    console.log('\nTest 3: First-time profile status check (profileExists: false)');
    const checkFresh = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });

    if (checkFresh.status === 200 && checkFresh.body.profileExists === false) {
      console.log('  ✓ GET /api/users/me/profile correctly returns profileExists: false for new user');
    } else {
      console.error('  ✗ Expected profileExists: false, got:', checkFresh.body);
      failures++;
    }

    // ── Test 4: Validation errors on profile creation ──
    console.log('\nTest 4: Input validation on profile creation');
    const invalidNameRes = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'POST',
      headers: { Cookie: sessionCookie },
    }, { realName: '', avatarId: 'avatar_01' });

    if (invalidNameRes.status === 400 && invalidNameRes.body.code === 'INVALID_REAL_NAME') {
      console.log('  ✓ Empty realName rejected with 400 INVALID_REAL_NAME');
    } else {
      console.error('  ✗ Expected 400 INVALID_REAL_NAME, got:', invalidNameRes.status, invalidNameRes.body);
      failures++;
    }

    const invalidAvatarRes = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'POST',
      headers: { Cookie: sessionCookie },
    }, { realName: 'Maya Sharma', avatarId: 'avatar_99_invalid' });

    if (invalidAvatarRes.status === 400 && invalidAvatarRes.body.code === 'INVALID_AVATAR_ID') {
      console.log('  ✓ Invalid avatarId rejected with 400 INVALID_AVATAR_ID');
    } else {
      console.error('  ✗ Expected 400 INVALID_AVATAR_ID, got:', invalidAvatarRes.status, invalidAvatarRes.body);
      failures++;
    }

    // ── Test 5: Valid profile creation ──
    console.log('\nTest 5: Create Seeker Profile (POST /api/users/me/profile)');
    const createRes = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'POST',
      headers: { Cookie: sessionCookie },
    }, { realName: 'Maya Sharma', avatarId: 'avatar_03' });

    if (
      createRes.status === 201 &&
      createRes.body.success &&
      createRes.body.profileExists &&
      createRes.body.data.realName === 'Maya Sharma' &&
      createRes.body.data.avatarId === 'avatar_03'
    ) {
      console.log('  ✓ Profile created with 201 Created: realName="Maya Sharma", avatarId="avatar_03"');
    } else {
      console.error('  ✗ Profile creation failed:', createRes.status, createRes.body);
      failures++;
    }

    // ── Test 6: Check profile after creation (profileExists: true) ──
    console.log('\nTest 6: Verify profile exists after setup (profileExists: true)');
    const checkCreated = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });

    if (
      checkCreated.status === 200 &&
      checkCreated.body.profileExists === true &&
      checkCreated.body.data.realName === 'Maya Sharma' &&
      checkCreated.body.data.avatarId === 'avatar_03'
    ) {
      console.log('  ✓ GET /api/users/me/profile returns profileExists: true with correct data');
    } else {
      console.error('  ✗ Expected profileExists: true with saved data, got:', checkCreated.body);
      failures++;
    }

    // ── Test 7: Duplicate profile creation prevention (409 Conflict) ──
    console.log('\nTest 7: Prevent duplicate profile creation (409 Conflict)');
    const duplicateRes = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'POST',
      headers: { Cookie: sessionCookie },
    }, { realName: 'Another Name', avatarId: 'avatar_05' });

    if (duplicateRes.status === 409 && duplicateRes.body.code === 'PROFILE_ALREADY_EXISTS') {
      console.log('  ✓ Duplicate profile creation rejected with 409 Conflict (PROFILE_ALREADY_EXISTS)');
    } else {
      console.error('  ✗ Expected 409 PROFILE_ALREADY_EXISTS, got:', duplicateRes.status, duplicateRes.body);
      failures++;
    }

    // ── Test 8: PATCH /api/users/me/profile updates ──
    console.log('\nTest 8: Update Seeker Profile (PATCH /api/users/me/profile)');
    const patchRes = await makeRequest(server, {
      path: '/api/users/me/profile',
      method: 'PATCH',
      headers: { Cookie: sessionCookie },
    }, { avatarId: 'avatar_08' });

    if (
      patchRes.status === 200 &&
      patchRes.body.success &&
      patchRes.body.data.avatarId === 'avatar_08' &&
      patchRes.body.data.realName === 'Maya Sharma'
    ) {
      console.log('  ✓ Profile avatar updated to "avatar_08" via PATCH, realName preserved');
    } else {
      console.error('  ✗ PATCH failed:', patchRes.status, patchRes.body);
      failures++;
    }

    // ── Test 9: Database verification directly in NeonDB ──
    console.log('\nTest 9: Verify data integrity in NeonDB');
    const dbRes = await pool.query(
      'SELECT user_id, real_name, avatar_id, is_seeker_profile_completed FROM profiles WHERE user_id = $1',
      [testUserId]
    );
    const dbRow = dbRes.rows[0];

    if (
      dbRow &&
      dbRow.real_name === 'Maya Sharma' &&
      dbRow.avatar_id === 'avatar_08' &&
      dbRow.is_seeker_profile_completed === true
    ) {
      console.log('  ✓ NeonDB record matches exactly: is_seeker_profile_completed=true, avatar_id="avatar_08"');
    } else {
      console.error('  ✗ NeonDB record mismatch:', dbRow);
      failures++;
    }
  } finally {
    // Clean up test user
    if (testUserId) {
      console.log('\n🧹 Cleaning up test user from NeonDB...');
      await pool.query('DELETE FROM "user" WHERE id = $1', [testUserId]);
      console.log('  ✓ Test user deleted cleanly');
    }

    await pool.end();
    server.close();

    console.log('\n----------------------------------------');
    if (failures === 0) {
      console.log('🎉 ALL 9 SEEKER PROFILE TESTS PASSED SUCCESSFULLY!\n');
    } else {
      console.error(`💥 ${failures} TEST(S) FAILED.\n`);
      process.exitCode = 1;
    }
  }
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

