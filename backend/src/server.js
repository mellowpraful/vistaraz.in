/**
 * server.js — HTTP server entry point
 *
 * Responsible for:
 *   - Loading environment variables from .env
 *   - Starting the HTTP server on the configured port
 *   - Graceful shutdown on SIGTERM / SIGINT
 *
 * Run in development : npm run dev   (nodemon)
 * Run in production  : npm start     (node)
 */

import 'dotenv/config';

import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { authPool } from './config/auth.js';

const { PORT, NODE_ENV } = env;

// ─── Start HTTP server ────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`⚡ Vistaraz API server started`, {
    port: PORT,
    env: NODE_ENV,
    health: `http://localhost:${PORT}/api/health`,
  });
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await authPool.end();
      logger.info('Database pools closed.');
    } catch (e) {
      logger.error('Error closing database pool', { error: e.message });
    }
    process.exit(0);
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled rejection / exception safety nets ─────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

