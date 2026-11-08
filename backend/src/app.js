/**
 * app.js — Express Application Factory
 *
 * Configures the Express app instance with:
 *   1. CORS with credentials support for Better Auth session cookies
 *   2. Rate limiting on authentication endpoints
 *   3. Better Auth handler mounted at /api/auth/* BEFORE body parsers
 *   4. JSON & URL-encoded body parsers for application routes
 *   5. Structured per-request logging
 *   6. Domain routes (/api/health, /api/users, /api/test)
 *   7. 404 not found catch-all
 *   8. Centralised error handler
 */

import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';

import { corsOptions } from './config/cors.js';
import { auth } from './config/auth.js';
import { authRateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { mountRoutes } from './routes/index.js';

const app = express();

// ─── 1. CORS with credentials ────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*path', cors(corsOptions));

// ─── 2. Better Auth Route (MUST precede body parsers) ────────────────────────
app.use('/api/auth/*splat', authRateLimiter);
app.all('/api/auth/*splat', toNodeHandler(auth));

// ─── 3. Body Parsers (for custom API routes) ─────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── 4. Request Logging ──────────────────────────────────────────────────────
app.use(requestLogger);

// ─── 5. API Routes ───────────────────────────────────────────────────────────
mountRoutes(app);

// ─── 6. 404 Catch-All ────────────────────────────────────────────────────────
app.use(notFound);

// ─── 7. Centralised Error Handler ────────────────────────────────────────────
app.use(errorHandler);

export default app;
