/**
 * db.js — NeonDB (PostgreSQL) connection layer
 *
 * Provides a centralised, reusable Neon PostgreSQL client using
 * the official @neondatabase/serverless driver.
 *
 * Key Design Principles:
 * - Lazy initialization: avoids application crash if DATABASE_URL is not yet provided.
 * - Singleton client: prevents connection leakage or duplicate client creation.
 * - Tagged-template & parameterized query support.
 * - Security: suppresses credential / secret leakage in error responses.
 * - Health check: safe query ping (SELECT NOW()) with latency tracking.
 */

import { neon } from '@neondatabase/serverless';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let sqlClient = null;

/**
 * Returns the singleton Neon SQL client.
 * Throws a safe, sanitized Error if DATABASE_URL is missing.
 */
export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured in environment variables.');
  }

  if (!sqlClient) {
    try {
      sqlClient = neon(env.DATABASE_URL);
      logger.info('NeonDB client initialized successfully');
    } catch (err) {
      logger.error('Failed to initialize Neon database client', {
        name: err.name,
        message: err.message,
      });
      throw new Error('Database client initialization failed.');
    }
  }

  return sqlClient;
}

/**
 * Tagged-template query helper:
 * const rows = await sql`SELECT * FROM users WHERE id = ${userId}`;
 *
 * Also supports parameterized calls:
 * const rows = await sql.query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export const sql = (...args) => {
  const db = getDb();
  return db(...args);
};

sql.query = (text, params) => {
  const db = getDb();
  return db.query(text, params);
};

/**
 * Executes a lightweight test query to verify NeonDB connectivity.
 * Sanitizes errors so no database host, credentials, or internal details leak.
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   latencyMs?: number,
 *   timestamp?: string,
 *   database?: string,
 *   error?: string
 * }>}
 */
export async function checkDbConnection() {
  if (!env.DATABASE_URL) {
    return {
      ok: false,
      error: 'DATABASE_URL is not configured',
    };
  }

  const startTime = Date.now();
  try {
    const db = getDb();
    const rows = await db`SELECT NOW() as now, current_database() as database`;
    const latencyMs = Date.now() - startTime;

    const row = rows?.[0];
    return {
      ok: true,
      latencyMs,
      timestamp: row?.now ? new Date(row.now).toISOString() : new Date().toISOString(),
      database: row?.database || 'connected',
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logger.error('NeonDB connectivity test failed', {
      name: err.name,
      message: err.message,
    });

    return {
      ok: false,
      latencyMs,
      error: 'Database connection failed. Please verify DATABASE_URL and network reachability.',
    };
  }
}

