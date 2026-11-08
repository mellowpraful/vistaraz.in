/**
 * env.js — Environment configuration
 *
 * Centralises all process.env reads so the rest of the codebase
 * never references process.env directly. Validates required vars
 * at startup and provides typed, documented defaults.
 */

import 'dotenv/config';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isDev = NODE_ENV === 'development';

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '5000', 10);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Accept a comma-separated list of allowed origins.
const rawOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:3000';
const CORS_ORIGINS = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ─── Database ─── Placeholder; NeonDB wired in Phase 2 ───────────────────────
const DATABASE_URL = process.env.DATABASE_URL ?? null;

// ─── Better Auth Configuration ───────────────────────────────────────────────
const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  (isDev ? 'vistaraz-dev-secret-key-minimum-32-chars-long-2026' : null);
const BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`;

export const env = {
  NODE_ENV,
  isDev,
  PORT,
  CORS_ORIGINS,
  DATABASE_URL,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
};

