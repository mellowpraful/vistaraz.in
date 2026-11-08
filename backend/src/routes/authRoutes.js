/**
 * authRoutes.js — Extended Authentication & Profile Routes
 *
 * Mounted under /api/auth in app.js:
 *   - GET  /api/auth/me           (Requires authentication)
 *   - POST /api/auth/declare-role (Requires authentication, rejects privilege escalation)
 *
 * Note: Core Better Auth endpoints (/api/auth/sign-in/*, /api/auth/sign-up/*, /api/auth/sign-out, etc.)
 * are handled directly by Better Auth's handler mounted in app.js.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/rbac.js';
import { getMe, declareRole } from '../controllers/authController.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.post('/declare-role', requireAuth, declareRole);

export default router;

