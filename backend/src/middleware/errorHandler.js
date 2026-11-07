/**
 * errorHandler.js — Centralised Express error-handling middleware
 *
 * Must be registered LAST in app.js (after all routes).
 * Catches every error thrown or passed to next(err) anywhere in
 * the middleware chain.
 *
 * Returns a consistent JSON envelope:
 *   { success: false, error: <message>, code: <string> }
 */

import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Custom application error class.
 * Controllers can throw new AppError('message', 400, 'BAD_REQUEST')
 * and the handler will forward status + code automatically.
 */
export class AppError extends Error {
  /**
   * @param {string} message  Human-readable error description.
   * @param {number} status   HTTP status code.
   * @param {string} code     Machine-readable error code.
   */
  constructor(message, status = 500, code = 'SERVER_ERROR') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Express centralised error handler.
 * Signature must have 4 parameters for Express to recognise it
 * as an error-handling middleware.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Determine status and code from AppError or fall back to defaults
  const status = err.status ?? 500;
  const code = err.code ?? 'SERVER_ERROR';
  const message =
    status < 500 || env.isDev
      ? err.message
      : 'An unexpected error occurred. Please try again later.';

  // Always log the full error server-side
  logger.error(`${req.method} ${req.originalUrl} → ${status} ${code}`, {
    message: err.message,
    stack: env.isDev ? err.stack : undefined,
  });

  return res.status(status).json({
    success: false,
    error: message,
    code,
  });
}

