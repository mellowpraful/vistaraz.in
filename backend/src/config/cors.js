/**
 * cors.js — CORS configuration object
 *
 * Reads allowed origins from env and returns a cors-compatible
 * options object.  Supports credentials for future cookie-based
 * Better Auth sessions.
 */

import { env } from './env.js';

export const corsOptions = {
  /**
   * Dynamic origin check: allow any origin that appears in
   * CORS_ORIGINS.  Also allows server-to-server requests with
   * no Origin header (origin === undefined).
   */
  origin(requestOrigin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, server-side)
    if (!requestOrigin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      ...env.CORS_ORIGINS,
      'https://vistaraz.in',
      'https://www.vistaraz.in',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ];

    const isVercel = requestOrigin.endsWith('.vercel.app');

    if (allowedOrigins.includes(requestOrigin) || isVercel) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${requestOrigin}' is not allowed`));
  },

  // Required for Better Auth cookie-based sessions (Phase 3)
  credentials: true,

  // Explicitly allow standard methods and common headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
};

