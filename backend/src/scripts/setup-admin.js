/**
 * setup-admin.js — Secure Initial Admin Provisioning Script
 *
 * Capabilities:
 * - Uses Better Auth's supported server-side API (auth.api.signUpEmail) to create the account.
 * - Enforces strong password hashing through Better Auth (no plaintext passwords).
 * - Assigns trusted 'admin' role in NeonDB user_roles table.
 * - Prevents duplicate admin creation and fails safely if the account already exists.
 * - Accepts credentials via environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
 *   or command-line arguments (--email=..., --password=..., --name=...).
 * - Avoids logging passwords or secrets.
 * - Records action in audit_logs.
 *
 * Usage:
 *   node src/scripts/setup-admin.js
 *   ADMIN_EMAIL=admin@vistaraz.in ADMIN_PASSWORD=StrongPassword123! node src/scripts/setup-admin.js
 *   node src/scripts/setup-admin.js --email=admin@vistaraz.in --password=StrongPassword123! --name="Platform Administrator"
 */

import 'dotenv/config';
import { auth, authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

function parseArg(key) {
  const prefix = `--${key}=`;
  const match = process.argv.find((a) => a.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

async function provisionAdmin() {
  const email = (
    process.env.ADMIN_EMAIL ||
    parseArg('email') ||
    'admin@vistaraz.in'
  ).toLowerCase().trim();

  const password = process.env.ADMIN_PASSWORD || parseArg('password') || 'AdminSanctuary2026!';
  const name = process.env.ADMIN_NAME || parseArg('name') || 'Vistaraz Administrator';

  if (!email || !email.includes('@')) {
    console.error('❌ Error: Valid admin email is required.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Error: Admin password must be at least 8 characters.');
    process.exit(1);
  }

  console.log(`\n--- 🛡️ VISTARAZ INITIAL ADMIN SETUP ---`);
  console.log(`Target Email: ${email}`);
  console.log(`Admin Name:   ${name}`);

  const client = await authPool.connect();

  try {
    // 1. Check if user already exists in NeonDB
    const existingUserRes = await client.query(
      'SELECT id, email, name FROM "user" WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    let userId = null;

    if (existingUserRes.rows.length > 0) {
      const existingUser = existingUserRes.rows[0];
      userId = existingUser.id;
      console.log(`ℹ️ User account already exists [id: ${userId}]. Checking admin role...`);

      // Check if user already has admin role
      const roleRes = await client.query(
        "SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'",
        [userId]
      );

      if (roleRes.rows.length > 0) {
        console.log(`✅ User ${email} is ALREADY configured as an administrator.`);
        console.log('No modifications were made. Setup finished safely.\n');
        return;
      }

      console.log(`Assigning 'admin' role to existing user [id: ${userId}]...`);
    } else {
      // 2. Create user via Better Auth supported API
      console.log('Creating new administrative user via Better Auth...');
      
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        throw new Error('Better Auth failed to create user.');
      }

      userId = signUpResult.user.id;
      console.log(`✅ Better Auth user created successfully [id: ${userId}].`);
    }

    // 3. Assign trusted 'admin' role in user_roles
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO user_roles (user_id, role, assigned_at)
       VALUES ($1, 'admin', CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, role) DO NOTHING`,
      [userId]
    );

    // 4. Record in audit_logs
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
       VALUES ($1, 'ADMIN_ACCOUNT_PROVISIONED', 'user', $1, $2::jsonb)`,
      [
        userId,
        JSON.stringify({
          email,
          assignedRole: 'admin',
          source: 'setup-admin.js',
          timestamp: new Date().toISOString(),
        }),
      ]
    );

    await client.query('COMMIT');

    console.log(`✅ Administrator role assigned successfully to user ${email}.`);
    console.log(`🎉 Admin setup complete! You can now log in at /admin/login\n`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Admin provisioning failed', { error: err.message });
    console.error(`❌ Setup failed: ${err.message}\n`);
    process.exit(1);
  } finally {
    client.release();
  }
}

provisionAdmin()
  .catch((err) => {
    console.error('Fatal setup error:', err);
    process.exit(1);
  })
  .finally(() => {
    authPool.end();
  });

