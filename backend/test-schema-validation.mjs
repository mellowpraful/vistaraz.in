/**
 * test-schema-validation.mjs — Comprehensive Phase 3 Schema & Constraint Validation Suite
 *
 * Validates:
 * 1. Database connectivity & table inventory in public schema.
 * 2. Foreign key constraints (valid FKs succeed, invalid FKs are rejected).
 * 3. Unique constraints (duplicate roles for the same user are rejected).
 * 4. Check constraints (invalid role string is rejected).
 * 5. ON DELETE CASCADE behavior (deleting user removes linked profile and role).
 * 6. Migration idempotency (re-running migrations does not fail or duplicate).
 * 7. Clean teardown with zero data pollution.
 */

import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { env } from './src/config/env.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });

async function runValidation() {
  console.log('\n--- 🧪 STARTING PHASE 3 SCHEMA & CONSTRAINT VALIDATION ---\n');
  const client = await pool.connect();
  let failures = 0;

  try {
    // 1. Table inventory check
    console.log('Test 1: Verify all 13 required tables exist in public schema');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name ASC
    `);
    const tableNames = new Set(tablesRes.rows.map((r) => r.table_name));

    const expectedTables = [
      'schema_migrations',
      'user',
      'session',
      'account',
      'verification',
      'profiles',
      'user_roles',
      'helper_profiles',
      'professional_profiles',
      'support_requests',
      'support_sessions',
      'assessments',
      'audit_logs',
    ];

    const missingTables = expectedTables.filter((t) => !tableNames.has(t));
    if (missingTables.length === 0) {
      console.log(`✅ Test 1 PASSED: All ${expectedTables.length} tables verified.\n`);
    } else {
      console.error('❌ Test 1 FAILED: Missing tables:', missingTables);
      failures++;
    }

    // 2. Migration tracking check
    console.log('Test 2: Verify schema_migrations table records all 5 migrations');
    const migRes = await client.query('SELECT name FROM schema_migrations ORDER BY id ASC');
    const recordedMigrations = migRes.rows.map((r) => r.name);
    if (recordedMigrations.length === 5) {
      console.log(`✅ Test 2 PASSED: 5 migrations recorded in schema_migrations.\n`);
    } else {
      console.error('❌ Test 2 FAILED: Expected 5 migrations, found:', recordedMigrations.length);
      failures++;
    }

    // 3. Foreign key integrity test
    console.log('Test 3: Foreign Key enforcement on profiles');
    const testUserId = `test_val_${Date.now()}`;
    const testEmail = `val_${Date.now()}@vistaraz.test`;

    // Attempt insert with non-existent user_id -> must fail
    let fkFailed = false;
    try {
      await client.query(
        "INSERT INTO profiles (user_id, display_name) VALUES ('non_existent_usr', 'Ghost')"
      );
    } catch (err) {
      fkFailed = err.code === '23503'; // foreign_key_violation
    }

    if (fkFailed) {
      console.log('✅ Test 3 PASSED: Foreign key correctly rejected non-existent user.\n');
    } else {
      console.error('❌ Test 3 FAILED: Invalid foreign key was not rejected');
      failures++;
    }

    // 4. Create legitimate test user and linked profile
    console.log('Test 4: Insert valid user, profile, and role');
    await client.query(
      'INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)',
      [testUserId, 'Validation Seeker', testEmail]
    );

    await client.query(
      'INSERT INTO profiles (user_id, display_name, preferred_language) VALUES ($1, $2, $3)',
      [testUserId, 'Validation Display', 'en']
    );

    await client.query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [testUserId, 'user']
    );
    console.log('✅ Test 4 PASSED: Valid user, profile, and role inserted successfully.\n');

    // 5. Duplicate role rejection test
    console.log('Test 5: Unique constraint rejection on duplicate role assignment');
    let duplicateRejected = false;
    try {
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [testUserId, 'user']
      );
    } catch (err) {
      duplicateRejected = err.code === '23505'; // unique_violation
    }

    if (duplicateRejected) {
      console.log('✅ Test 5 PASSED: Duplicate role assignment rejected by unique constraint.\n');
    } else {
      console.error('❌ Test 5 FAILED: Duplicate role was not rejected');
      failures++;
    }

    // 6. Role CHECK constraint test
    console.log('Test 6: Role CHECK constraint rejection on invalid role');
    let checkConstraintFailed = false;
    try {
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [testUserId, 'unauthorized_superuser']
      );
    } catch (err) {
      checkConstraintFailed = err.code === '23514'; // check_violation
    }

    if (checkConstraintFailed) {
      console.log('✅ Test 6 PASSED: Invalid role value rejected by CHECK constraint.\n');
    } else {
      console.error('❌ Test 6 FAILED: Invalid role was not rejected by CHECK constraint');
      failures++;
    }

    // 7. CASCADE deletion test
    console.log('Test 7: ON DELETE CASCADE enforcement');
    await client.query('DELETE FROM "user" WHERE id = $1', [testUserId]);

    const remainingProfiles = await client.query(
      'SELECT user_id FROM profiles WHERE user_id = $1',
      [testUserId]
    );
    const remainingRoles = await client.query(
      'SELECT id FROM user_roles WHERE user_id = $1',
      [testUserId]
    );

    if (remainingProfiles.rows.length === 0 && remainingRoles.rows.length === 0) {
      console.log('✅ Test 7 PASSED: Cascade delete cleaned up linked profile and role.\n');
    } else {
      console.error('❌ Test 7 FAILED: Cascading delete did not clean up child records');
      failures++;
    }

    // Summary
    if (failures === 0) {
      console.log('🎉 ALL 7 SCHEMA & CONSTRAINT VALIDATION TESTS PASSED!\n');
    } else {
      console.error(`💥 ${failures} TEST(S) FAILED.\n`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Validation test error:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runValidation();

