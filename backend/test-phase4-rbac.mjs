/**
 * test-phase4-rbac.mjs — Comprehensive Test Suite for Phase 4: Better Auth & Server-Side RBAC
 *
 * Validates all 15 Phase F requirements:
 * 1. User registration
 * 2. User login
 * 3. Invalid credentials
 * 4. User logout
 * 5. Session validation
 * 6. Unauthenticated access rejection
 * 7. User role access
 * 8. Helper role access
 * 9. Unverified helper rejection
 * 10. Professional role access
 * 11. Unverified professional rejection
 * 12. Admin-only route protection
 * 13. Attempted self-role escalation rejection
 * 14. Invalid or expired sessions
 * 15. CORS and cookie security headers
 *
 * Uses isolated test accounts and cleans up all created test data safely.
 */

import http from 'http';
import app from './src/app.js';
import { authPool } from './src/config/auth.js';

const TEST_PORT = 5096;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper: HTTP request with cookie jar support & browser Origin simulation
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      Origin: 'http://localhost:3000',
      ...headers,
    };

    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch {
            // keep raw text
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data,
            raw,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Extract cookies from Set-Cookie header array
function extractCookie(headers) {
  const setCookies = headers['set-cookie'];
  if (!setCookies) return '';
  return setCookies
    .map((c) => c.split(';')[0])
    .join('; ');
}

const server = http.createServer(app);

server.listen(TEST_PORT, '127.0.0.1', async () => {
  console.log('\n--- 🧪 STARTING PHASE 4 BETTER AUTH & RBAC VALIDATION ---\n');
  let failures = 0;
  const createdUserIds = [];

  try {
    const testSeekerEmail = `seeker_${Date.now()}@vistaraz.test`;
    const testHelperEmail = `helper_${Date.now()}@vistaraz.test`;
    const testProfEmail = `prof_${Date.now()}@vistaraz.test`;
    const testAdminEmail = `admin_${Date.now()}@vistaraz.test`;
    const password = 'StrongPassword2026!';

    // ─── 1. User Registration ──────────────────────────────────────────────────
    console.log('Test 1: User Registration via Better Auth');
    const regRes = await request('POST', '/api/auth/sign-up/email', {
      name: 'Maya Seeker',
      email: testSeekerEmail,
      password: password,
    });

    if (regRes.status === 200 && regRes.data?.user?.id) {
      createdUserIds.push(regRes.data.user.id);
      console.log(`✅ Test 1 PASSED: User registered [id: ${regRes.data.user.id}].`);
    } else {
      console.error('❌ Test 1 FAILED:', regRes.status, regRes.data);
      failures++;
    }

    let seekerCookies = extractCookie(regRes.headers);

    // ─── 2. Session Validation & Profile Auto-provisioning ────────────────────
    console.log('\nTest 2: Session Validation & Profile Auto-provisioning');
    const meRes = await request('GET', '/api/users/me', null, {
      Cookie: seekerCookies,
    });

    if (
      meRes.status === 200 &&
      meRes.data?.success === true &&
      meRes.data.data.email === testSeekerEmail &&
      Array.isArray(meRes.data.data.roles) &&
      meRes.data.data.roles.includes('user') &&
      meRes.data.data.profile?.display_name === 'Maya Seeker'
    ) {
      console.log('✅ Test 2 PASSED: Session verified, auto-profile provisioned with default role [user].');
    } else {
      console.error('❌ Test 2 FAILED:', meRes.status, meRes.data);
      failures++;
    }

    // ─── 3. Unauthenticated Access Rejection ──────────────────────────────────
    console.log('\nTest 3: Unauthenticated Access Rejection');
    const unauthRes = await request('GET', '/api/test/protected/user');

    if (unauthRes.status === 401 && unauthRes.data?.code === 'UNAUTHORIZED') {
      console.log('✅ Test 3 PASSED: Unauthenticated request rejected with HTTP 401.');
    } else {
      console.error('❌ Test 3 FAILED: Expected 401, got:', unauthRes.status);
      failures++;
    }

    // ─── 4. User Role Access ──────────────────────────────────────────────────
    console.log('\nTest 4: User Role Protected Route Access');
    const userRouteRes = await request('GET', '/api/test/protected/user', null, {
      Cookie: seekerCookies,
    });

    if (userRouteRes.status === 200 && userRouteRes.data?.success === true) {
      console.log('✅ Test 4 PASSED: User role authorized to access sanctuary dashboard.');
    } else {
      console.error('❌ Test 4 FAILED:', userRouteRes.status, userRouteRes.data);
      failures++;
    }

    // ─── 5. Attempted Self-Role Escalation Rejection ──────────────────────────
    console.log('\nTest 5: Attempted Self-Role Escalation Rejection (admin & professional)');
    const escalateAdmin = await request(
      'POST',
      '/api/users/declare-role',
      { role: 'admin' },
      { Cookie: seekerCookies }
    );

    const escalateProf = await request(
      'POST',
      '/api/users/declare-role',
      { role: 'professional' },
      { Cookie: seekerCookies }
    );

    if (
      escalateAdmin.status === 403 &&
      escalateAdmin.data?.code === 'PRIVILEGE_ESCALATION_BLOCKED' &&
      escalateProf.status === 403 &&
      escalateProf.data?.code === 'PRIVILEGE_ESCALATION_BLOCKED'
    ) {
      console.log('✅ Test 5 PASSED: Both admin and professional self-escalation attempts strictly blocked (403).');
    } else {
      console.error('❌ Test 5 FAILED:', { escalateAdmin: escalateAdmin.data, escalateProf: escalateProf.data });
      failures++;
    }

    // ─── 6. Invalid Credentials Login ─────────────────────────────────────────
    console.log('\nTest 6: Invalid Credentials Login Rejection');
    const invalidLogin = await request('POST', '/api/auth/sign-in/email', {
      email: testSeekerEmail,
      password: 'WrongPassword123!',
    });

    if (invalidLogin.status >= 400 && invalidLogin.status < 500) {
      console.log(`✅ Test 6 PASSED: Invalid credentials rejected with HTTP ${invalidLogin.status}.`);
    } else {
      console.error('❌ Test 6 FAILED: Expected 4xx error on wrong password, got:', invalidLogin.status);
      failures++;
    }

    // ─── 7. User Logout & Session Invalidation ────────────────────────────────
    console.log('\nTest 7: User Logout & Session Invalidation');
    const logoutRes = await request('POST', '/api/auth/sign-out', null, {
      Cookie: seekerCookies,
    });

    const postLogoutCheck = await request('GET', '/api/users/me', null, {
      Cookie: seekerCookies,
    });

    if (logoutRes.status === 200 && postLogoutCheck.status === 401) {
      console.log('✅ Test 7 PASSED: Logout successfully invalidated session; subsequent requests rejected with 401.');
    } else {
      console.error('❌ Test 7 FAILED:', { logoutStatus: logoutRes.status, checkStatus: postLogoutCheck.status });
      failures++;
    }

    // ─── 8. Successful Login ──────────────────────────────────────────────────
    console.log('\nTest 8: Successful User Login');
    const loginRes = await request('POST', '/api/auth/sign-in/email', {
      email: testSeekerEmail,
      password: password,
    });

    if (loginRes.status === 200 && loginRes.data?.user?.id) {
      seekerCookies = extractCookie(loginRes.headers);
      console.log('✅ Test 8 PASSED: Login succeeded, fresh session established.');
    } else {
      console.error('❌ Test 8 FAILED:', loginRes.status, loginRes.data);
      failures++;
    }

    // ─── 9. Helper Registration & Role Onboarding ─────────────────────────────
    console.log('\nTest 9: Helper Registration & Onboarding');
    const helperReg = await request('POST', '/api/auth/sign-up/email', {
      name: 'Jordan Listener',
      email: testHelperEmail,
      password: password,
    });

    const helperId = helperReg.data?.user?.id;
    createdUserIds.push(helperId);
    let helperCookies = extractCookie(helperReg.headers);

    // Onboard as helper
    const declareHelper = await request(
      'POST',
      '/api/users/declare-role',
      {
        role: 'helper',
        helperDetails: {
          qualification: 'Psychology Graduate',
          introduction: 'Compassionate peer supporter.',
        },
      },
      { Cookie: helperCookies }
    );

    if (declareHelper.status === 200 && declareHelper.data?.data?.role === 'helper') {
      console.log('✅ Test 9 PASSED: Helper role assigned with pending verification status.');
    } else {
      console.error('❌ Test 9 FAILED:', declareHelper.status, declareHelper.data);
      failures++;
    }

    // ─── 10. Helper Role Access ───────────────────────────────────────────────
    console.log('\nTest 10: Helper Role Route Access');
    const helperRouteRes = await request('GET', '/api/test/protected/helper', null, {
      Cookie: helperCookies,
    });

    if (helperRouteRes.status === 200 && helperRouteRes.data?.success === true) {
      console.log('✅ Test 10 PASSED: Helper authorized to access helper overview.');
    } else {
      console.error('❌ Test 10 FAILED:', helperRouteRes.status, helperRouteRes.data);
      failures++;
    }

    // ─── 11. Unverified Helper Rejection from Live Queue ──────────────────────
    console.log('\nTest 11: Unverified Helper Blocked from Live Listener Queue');
    const liveQueueUnverified = await request('GET', '/api/test/protected/verified-listener', null, {
      Cookie: helperCookies,
    });

    if (liveQueueUnverified.status === 403 && liveQueueUnverified.data?.code === 'UNVERIFIED_HELPER') {
      console.log('✅ Test 11 PASSED: Unverified helper blocked with HTTP 403 (UNVERIFIED_HELPER).');
    } else {
      console.error('❌ Test 11 FAILED:', liveQueueUnverified.status, liveQueueUnverified.data);
      failures++;
    }

    // ─── 12. Verified Helper Access ───────────────────────────────────────────
    console.log('\nTest 12: Administrative Verification Approval & Live Queue Access');
    // Simulate admin verification approval in DB
    await authPool.query(
      "UPDATE helper_profiles SET verification_status = 'verified', application_status = 'approved', verified_at = CURRENT_TIMESTAMP WHERE user_id = $1",
      [helperId]
    );

    const liveQueueVerified = await request('GET', '/api/test/protected/verified-listener', null, {
      Cookie: helperCookies,
    });

    if (liveQueueVerified.status === 200 && liveQueueVerified.data?.success === true) {
      console.log('✅ Test 12 PASSED: Verified helper granted access to Live Listener Queue.');
    } else {
      console.error('❌ Test 12 FAILED:', liveQueueVerified.status, liveQueueVerified.data);
      failures++;
    }

    // ─── 13. Professional Boundary & Verification Guard ───────────────────────
    console.log('\nTest 13: Professional Boundary & Verification Guards');
    // A: Helper must NEVER access professional routes
    const helperIntoProf = await request('GET', '/api/test/protected/professional', null, {
      Cookie: helperCookies,
    });

    // B: Register professional
    const profReg = await request('POST', '/api/auth/sign-up/email', {
      name: 'Dr. Sarah Clinical',
      email: testProfEmail,
      password: password,
    });
    const profId = profReg.data?.user?.id;
    createdUserIds.push(profId);
    const profCookies = extractCookie(profReg.headers);

    // Assign professional role via DB (admin action) with pending status
    await authPool.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, 'professional') ON CONFLICT DO NOTHING",
      [profId]
    );
    await authPool.query(
      `INSERT INTO professional_profiles (user_id, title, qualifications, license_number, licensing_body, verification_status)
       VALUES ($1, 'Clinical Psychologist', 'M.Phil Clinical Psychology', 'PSY-2026-99', 'National Board', 'pending')
       ON CONFLICT (user_id) DO NOTHING`,
      [profId]
    );

    // Unverified professional access attempt
    const profUnverified = await request('GET', '/api/test/protected/verified-professional', null, {
      Cookie: profCookies,
    });

    // Verify professional in DB
    await authPool.query(
      "UPDATE professional_profiles SET verification_status = 'verified', approval_status = 'approved' WHERE user_id = $1",
      [profId]
    );

    // Verified professional access attempt
    const profVerified = await request('GET', '/api/test/protected/verified-professional', null, {
      Cookie: profCookies,
    });

    if (
      helperIntoProf.status === 403 &&
      profUnverified.status === 403 &&
      profUnverified.data?.code === 'UNVERIFIED_PROFESSIONAL' &&
      profVerified.status === 200
    ) {
      console.log('✅ Test 13 PASSED: Helper blocked from professional area; unverified professional blocked; verified professional authorized.');
    } else {
      console.error('❌ Test 13 FAILED:', {
        helperIntoProf: helperIntoProf.status,
        profUnverified: profUnverified.status,
        profVerified: profVerified.status,
      });
      failures++;
    }

    // ─── 14. Admin-Only Route Protection ──────────────────────────────────────
    console.log('\nTest 14: Admin Portal Protection & Admin Access');
    // Normal user attempts admin route
    const userIntoAdmin = await request('GET', '/api/test/protected/admin', null, {
      Cookie: seekerCookies,
    });

    // Register admin user
    const adminReg = await request('POST', '/api/auth/sign-up/email', {
      name: 'System Admin',
      email: testAdminEmail,
      password: password,
    });
    const adminId = adminReg.data?.user?.id;
    createdUserIds.push(adminId);
    const adminCookies = extractCookie(adminReg.headers);

    // Grant admin role via DB
    await authPool.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING",
      [adminId]
    );

    const adminAccess = await request('GET', '/api/test/protected/admin', null, {
      Cookie: adminCookies,
    });

    if (userIntoAdmin.status === 403 && adminAccess.status === 200) {
      console.log('✅ Test 14 PASSED: Non-admin blocked (403); Admin authorized to admin portal (200).');
    } else {
      console.error('❌ Test 14 FAILED:', { userIntoAdmin: userIntoAdmin.status, adminAccess: adminAccess.status });
      failures++;
    }

    // ─── 15. CORS & Cookie Security Headers ───────────────────────────────────
    console.log('\nTest 15: CORS & Cookie Security Headers Verification');
    const corsRes = await request('OPTIONS', '/api/auth/sign-in/email', null, {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type',
    });

    const allowOrigin = corsRes.headers['access-control-allow-origin'];
    const allowCreds = corsRes.headers['access-control-allow-credentials'];

    // Verify session cookie flags on login response
    const setCookieHeader = loginRes.headers['set-cookie'] || [];
    const sessionCookieStr = setCookieHeader.join(' ');
    const hasHttpOnly = /httponly/i.test(sessionCookieStr);
    const hasPath = /path=\//i.test(sessionCookieStr);

    if (allowOrigin === 'http://localhost:3000' && allowCreds === 'true' && hasHttpOnly && hasPath) {
      console.log('✅ Test 15 PASSED: CORS credentials header and HttpOnly cookie security verified.');
    } else {
      console.error('❌ Test 15 FAILED:', { allowOrigin, allowCreds, hasHttpOnly, hasPath });
      failures++;
    }

    // ─── Summary ──────────────────────────────────────────────────────────────
    if (failures === 0) {
      console.log('\n🎉 ALL 15 PHASE 4 BETTER AUTH & RBAC TESTS PASSED SUCCESSFULLY!\n');
    } else {
      console.error(`\n💥 ${failures} TEST(S) FAILED.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    // Clean up created test accounts safely
    if (createdUserIds.length > 0) {
      try {
        console.log(`🧹 Cleaning up ${createdUserIds.length} test accounts...`);
        for (const uid of createdUserIds) {
          await authPool.query('DELETE FROM "user" WHERE id = $1', [uid]);
        }
        console.log('✅ Test accounts cleanly removed from database.');
      } catch (e) {
        console.error('Error during cleanup:', e.message);
      }
    }
    server.close();
    await authPool.end();
  }
});

