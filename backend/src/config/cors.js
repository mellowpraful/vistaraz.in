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

    if (env.CORS_ORIGINS.includes(requestOrigin)) {
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

