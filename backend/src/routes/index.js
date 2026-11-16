/**
 * index.js — Route barrel file
 *
 * Registers all application API route modules onto the provided Express app.
 * Note: /api/auth/* is mounted directly in app.js via Better Auth's toNodeHandler.
 */

import healthRoutes from './healthRoutes.js';
import userRoutes from './userRoutes.js';
import testRoutes from './testRoutes.js';
import adminRoutes from './adminRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import communityRoutes from './communityRoutes.js';
import supporterRoutes from '../modules/supporters/supporter.routes.js';
import supportRequestRoutes from '../modules/support-requests/request.routes.js';
import sessionRoutes from '../modules/sessions/session.routes.js';

/**
 * @param {import('express').Application} app
 */
export function mountRoutes(app) {
  app.use('/api/health', healthRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/supporters', supporterRoutes);
  app.use('/api/support-requests', supportRequestRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/test', testRoutes);
}
