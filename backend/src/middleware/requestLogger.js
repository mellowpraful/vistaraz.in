/**
 * requestLogger.js — Per-request HTTP logging middleware
 *
 * Logs incoming requests and their responses with method, path,
 * status code, and duration.  Keeps the development console
 * readable and provides an audit trail in production.
 *
 * Example output:
 *   [2026-11-07T12:00:00.000Z] [INFO ] → GET /api/health
 *   [2026-11-07T12:00:00.012Z] [INFO ] ← GET /api/health 200 (12ms)
 */

import { logger } from '../utils/logger.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  logger.info(`→ ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`← ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });

  next();
}

