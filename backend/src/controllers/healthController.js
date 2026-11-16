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

/**
 * GET /api/health/debug-env
 * Diagnostic: safely reports presence of required env variables without exposing any values.
 */
export function getEnvDebug(_req, res) {
  const safeKeys = Object.keys(process.env)
    .filter((k) => !k.startsWith('npm_') && !k.startsWith('_'))
    .sort();

  return res.status(200).json({
    success: true,
    availableKeys: safeKeys,
    vercelProjectName: process.env.VERCEL_PROJECT_NAME || null,
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelTargetEnv: process.env.VERCEL_TARGET_ENV || null,
    vercelGitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    vercelUrl: process.env.VERCEL_URL || null,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL || null,
    hasDatabaseUrl: Boolean(env.DATABASE_URL),
    hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID || process.env.AUTH_GOOGLE_ID),
    hasGoogleSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || process.env.AUTH_GOOGLE_SECRET),
    hasBetterAuthSecret: Boolean(process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET),
  });
}
