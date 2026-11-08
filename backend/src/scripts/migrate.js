/**
 * migrate.js — Safe, Transactional Database Migration Runner
 *
 * Capabilities:
 * - Automatically initializes `schema_migrations` table if not present.
 * - Discovers and sorts all SQL migration files in `backend/migrations/`.
 * - Prevents duplicate execution by checking recorded migrations.
 * - Wraps every migration in an isolated BEGIN...COMMIT transaction.
 * - On error, triggers an immediate ROLLBACK, reports failure, and aborts.
 * - Supports `--status` flag to preview migration state without executing.
 * - Sanitizes all logs to ensure database credentials never leak.
 *
 * Usage:
 *   node src/scripts/migrate.js           # Run pending migrations
 *   node src/scripts/migrate.js --status  # Check migration status
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

/**
 * Initializes the migration tracking table in NeonDB.
 *
 * @param {import('@neondatabase/serverless').PoolClient} client
 */
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Retrieves the set of already applied migration names.
 *
 * @param {import('@neondatabase/serverless').PoolClient} client
 * @returns {Promise<Set<string>>}
 */
async function getAppliedMigrations(client) {
  const result = await client.query(
    'SELECT name, executed_at FROM schema_migrations ORDER BY id ASC'
  );
  return new Map(result.rows.map((r) => [r.name, r.executed_at]));
}

/**
 * Discovers and returns all .sql files in the migrations directory in sorted order.
 *
 * @returns {Promise<string[]>}
 */
async function getMigrationFiles() {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Main migration runner entrypoint.
 */
async function run() {
  if (!env.DATABASE_URL) {
    logger.error('Cannot run migrations: DATABASE_URL is not configured.');
    process.exit(1);
  }

  const isStatusOnly = process.argv.includes('--status');
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  let client;

  try {
    client = await pool.connect();
    await ensureMigrationsTable(client);

    const appliedMap = await getAppliedMigrations(client);
    const files = await getMigrationFiles();

    if (files.length === 0) {
      logger.info('No SQL migration files found in migrations directory.');
      return;
    }

    if (isStatusOnly) {
      console.log('\n--- 📋 NeonDB Migration Status ---');
      for (const file of files) {
        const isApplied = appliedMap.has(file);
        const status = isApplied ? `✅ APPLIED (${appliedMap.get(file).toISOString()})` : '⏳ PENDING';
        console.log(`  ${file.padEnd(45)} ${status}`);
      }
      console.log('----------------------------------\n');
      return;
    }

    const pendingFiles = files.filter((f) => !appliedMap.has(f));

    if (pendingFiles.length === 0) {
      logger.info('Database schema is up to date. No pending migrations.');
      return;
    }

    logger.info(`Starting migration batch: ${pendingFiles.length} pending migration(s)...`);

    for (const file of pendingFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = await fs.readFile(filePath, 'utf-8');
      const startTime = Date.now();

      logger.info(`Applying migration: ${file}...`);

      try {
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');

        const duration = Date.now() - startTime;
        logger.info(`✅ Successfully applied ${file} (${duration}ms)`);
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`❌ Migration failed: ${file} — transaction rolled back.`, {
          error: err.message,
          code: err.code,
        });
        throw err;
      }
    }

    logger.info('🎉 All migrations completed successfully.');
  } catch (err) {
    logger.error('Migration runner terminated with error.', {
      message: err.message,
    });
    process.exitCode = 1;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

run();

