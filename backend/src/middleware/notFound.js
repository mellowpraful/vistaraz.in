/**
 * notFound.js — 404 catch-all middleware
 *
 * Registered after all routes.  Any request that doesn't match a
 * defined route falls through to here and receives a structured
 * 404 response rather than Express's default HTML error page.
 */

import { AppError } from './errorHandler.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

