/**
 * userRoutes.js — Application User & Sanctuary Profile Endpoints
 *
 * Mounted under /api/users in app.js:
 *   - GET   /api/users/me           (Requires authentication — returns user, profile, roles)
 *   - POST  /api/users/declare-role (Requires authentication — safe onboarding role selection)
 *   - GET   /api/users/me/profile   (Requires authentication — checks & returns Seeker Profile)
 *   - POST  /api/users/me/profile   (Requires authentication — creates Seeker Profile)
 *   - PATCH /api/users/me/profile   (Requires authentication — updates Seeker Profile)
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/rbac.js';
import { getMe, declareRole } from '../controllers/authController.js';
import {
  getSeekerProfile,
  createSeekerProfile,
  updateSeekerProfile,
} from '../controllers/profileController.js';
import {
  getDashboardStats,
  getMySessions,
  recordMood,
  getLatestMood,
  recordAssessment,
  getLatestAssessment,
} from '../controllers/clientController.js';

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

/**
 * GET /api/users/me/dashboard-stats
 * Returns live aggregated counts for sessions, check-ins, moods, and active care metrics.
 */
router.get('/me/dashboard-stats', requireAuth, getDashboardStats);

/**
 * GET /api/users/me/sessions
 * Returns real session history for the authenticated user from support_sessions.
 */
router.get('/me/sessions', requireAuth, getMySessions);

/**
 * POST /api/users/me/moods
 * Persists daily mood check-in (Low, Tense, Okay, Good, Bright) in assessments table.
 */
router.post('/me/moods', requireAuth, recordMood);

/**
 * GET /api/users/me/moods/latest
 * Returns the authenticated user's most recent mood check-in.
 */
router.get('/me/moods/latest', requireAuth, getLatestMood);

/**
 * POST /api/users/me/assessments
 * Alternative endpoint for assessment persistence under user path.
 */
router.post('/me/assessments', requireAuth, recordAssessment);

/**
 * GET /api/users/me/assessments/latest
 * Returns latest 10-area assessment.
 */
router.get('/me/assessments/latest', requireAuth, getLatestAssessment);

/**
 * GET /api/users/me/profile
 * Checks if authenticated user has a completed Seeker Profile.
 * Returns { profileExists: false } if unconfigured, or profile data if completed.
 */
router.get('/me/profile', requireAuth, getSeekerProfile);

/**
 * POST /api/users/me/profile
 * Creates initial Seeker Profile with validated Real Name and Avatar ID (avatar_01 - avatar_12).
 * Rejects duplicate creation (409 Conflict).
 */
router.post('/me/profile', requireAuth, createSeekerProfile);

/**
 * PATCH /api/users/me/profile
 * Allows updating user's Real Name or Avatar selection.
 */
router.patch('/me/profile', requireAuth, updateSeekerProfile);

export default router;
