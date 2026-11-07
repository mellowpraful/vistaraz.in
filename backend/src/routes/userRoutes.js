/**
 * userRoutes.js — Application User & Sanctuary Profile Endpoints
 *
 * Mounted under /api/users in app.js:
 *   - GET  /api/users/me           (Requires authentication — returns user, profile, roles)
 *   - POST /api/users/declare-role (Requires authentication — safe onboarding role selection)
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/rbac.js';
import { getMe, declareRole } from '../controllers/authController.js';

const router = Router();

/**
 * GET /api/users/me
 * Returns sanitized authenticated user, sanctuary profile, and verified role statuses.
 */
router.get('/me', requireAuth, getMe);

/**
 * POST /api/users/declare-role
 * Allows users to choose between 'user' and 'helper' during onboarding.
 * Privileged roles ('admin', 'professional') are strictly rejected.
 */
router.post('/declare-role', requireAuth, declareRole);

export default router;

