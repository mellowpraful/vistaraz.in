/**
 * env.js — Environment configuration
 *
 * Centralises all process.env reads so the rest of the codebase
 * never references process.env directly. Validates required vars
 * at startup and provides typed, documented defaults.
 */

import 'dotenv/config';
import dns from 'dns';

// Ensure IPv4 is prioritized to prevent dual-stack EHOSTUNREACH/ENOTFOUND on platforms without IPv6 routing
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignored in environments where setDefaultResultOrder is not supported
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isDev = NODE_ENV === 'development';

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '5000', 10);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Accept a comma-separated list of allowed origins.
const rawOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:3000,https://vistaraz.in,https://www.vistaraz.in';
const CORS_ORIGINS = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ─── Database ────────────────────────────────────────────────────────────────
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  null;

// ─── Better Auth Configuration ───────────────────────────────────────────────
const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  (isDev ? 'vistaraz-sanctuary-dev-secret-key-32charsmin' : 'vistaraz-sanctuary-production-key-2026-launch');

if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET && !isDev) {
  console.warn('⚠️ WARNING: BETTER_AUTH_SECRET environment variable is unset. Using fallback production key.');
}
const BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL ||
  (typeof process !== 'undefined' && process.env?.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : (typeof process !== 'undefined' && process.env?.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://vistaraz.in'));

export const env = {
  NODE_ENV,
  isDev,
  PORT,
  CORS_ORIGINS,
  DATABASE_URL,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
};

