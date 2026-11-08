/**
 * Comprehensive verification script for Phase 2: NeonDB Integration
 *
 * Tests:
 * 1. GET /api/health returns HTTP 200
 * 2. GET /api/health/db returns controlled HTTP 503 when DATABASE_URL is unset
 * 3. GET /api/health/db returns controlled HTTP 503 when DATABASE_URL has invalid credentials
 * 4. Ensures no credentials or connection strings are ever leaked in responses
 */

import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';

const TEST_PORT = 5098;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${TEST_PORT}${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    }).on('error', reject);
  });
}

const server = http.createServer(app);

server.listen(TEST_PORT, '127.0.0.1', async () => {
  console.log('\n--- 🧪 STARTING PHASE 2 NEON INTEGRATION TESTS ---\n');
  let failures = 0;

  try {
    // 1. General health check
    console.log('Test 1: GET /api/health (Server status)');
    const healthRes = await makeRequest('/api/health');
    console.log('Status:', healthRes.status);
    console.log('Body:', JSON.stringify(healthRes.data, null, 2));
    if (healthRes.status === 200 && healthRes.data.success === true) {
      console.log('✅ Test 1 PASSED: /api/health is working.\n');
    } else {
      console.error('❌ Test 1 FAILED');
      failures++;
    }

    // 2. DB health check with unconfigured DATABASE_URL
    console.log('Test 2: GET /api/health/db (When DATABASE_URL is not configured)');
    const prevUrl = env.DATABASE_URL;
    env.DATABASE_URL = null;

    const dbHealthUnset = await makeRequest('/api/health/db');
    console.log('Status:', dbHealthUnset.status);
    console.log('Body:', JSON.stringify(dbHealthUnset.data, null, 2));

    if (
      dbHealthUnset.status === 503 &&
      dbHealthUnset.data.success === false &&
      dbHealthUnset.data.data.database.connected === false &&
      dbHealthUnset.data.data.database.error === 'DATABASE_URL is not configured'
    ) {
      console.log('✅ Test 2 PASSED: Controlled 503 returned when DATABASE_URL is unset.\n');
    } else {
      console.error('❌ Test 2 FAILED');
      failures++;
    }

    // 3. DB health check with invalid credentials
    console.log('Test 3: GET /api/health/db (When DATABASE_URL has invalid credentials)');
    env.DATABASE_URL = 'postgresql://fake_user:fake_password_12345@ep-invalid-test.neon.tech/neondb?sslmode=require';

    const dbHealthInvalid = await makeRequest('/api/health/db');
    console.log('Status:', dbHealthInvalid.status);
    console.log('Body:', JSON.stringify(dbHealthInvalid.data, null, 2));

    const bodyStr = JSON.stringify(dbHealthInvalid.data);
    const leakedPassword = bodyStr.includes('fake_password_12345');
    const leakedUser = bodyStr.includes('fake_user');

    if (
      dbHealthInvalid.status === 503 &&
      dbHealthInvalid.data.success === false &&
      dbHealthInvalid.data.data.database.connected === false &&
      !leakedPassword &&
      !leakedUser
    ) {
      console.log('✅ Test 3 PASSED: Controlled 503 returned, no credentials leaked.\n');
    } else {
      console.error('❌ Test 3 FAILED: Status or leakage check failed');
      failures++;
    }

    // Restore env
    env.DATABASE_URL = prevUrl;

    if (failures === 0) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
    } else {
      console.error(`💥 ${failures} TEST(S) FAILED.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

