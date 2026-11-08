/**
 * healthController.js — Health-check endpoint handlers
 *
 * Provides:
 * - GET /api/health    — General API server health and environment status
 * - GET /api/health/db — Dedicated NeonDB connection verification
 */

import { sendSuccess } from '../utils/response.js';
import { env } from '../config/env.js';
import { checkDbConnection } from '../config/db.js';

/**
 * GET /api/health
 *
 * Returns a lightweight server status report.
 *
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function getHealth(_req, res) {
  const uptimeSeconds = Math.floor(process.uptime());

  return sendSuccess(
    res,
    {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: `${uptimeSeconds}s`,
      node: process.version,
      database: env.DATABASE_URL ? 'connected' : 'not configured',
      auth: env.BETTER_AUTH_SECRET ? 'active (Better Auth)' : 'not configured',
    },
    'Vistaraz API is healthy',
  );
}

/**
 * GET /api/health/db
 *
 * Verifies live connectivity to NeonDB.
 * Returns HTTP 200 on successful connection and test query execution.
 * Returns HTTP 503 if the database is unreachable or misconfigured.
 *
 * Does not expose database credentials or connection strings.
 *
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export async function getDbHealth(_req, res) {
  const result = await checkDbConnection();

  if (!result.ok) {
    return res.status(503).json({
      success: false,
      message: 'Database health check failed',
      data: {
        server: 'ok',
        database: {
          connected: false,
          error: result.error,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'NeonDB connection verified successfully',
    data: {
      server: 'ok',
      database: {
        connected: true,
        database: result.database,
        latencyMs: result.latencyMs,
      },
      timestamp: result.timestamp,
    },
  });
}
