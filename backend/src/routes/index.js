/**
 * index.js — Route barrel file
 *
 * Registers all application API route modules onto the provided Express app.
 * Note: /api/auth/* is mounted directly in app.js via Better Auth's toNodeHandler.
 */

import healthRoutes from './healthRoutes.js';
import userRoutes from './userRoutes.js';
import testRoutes from './testRoutes.js';

/**
 * @param {import('express').Application} app
 */
export function mountRoutes(app) {
  app.use('/api/health', healthRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/test', testRoutes);
}
