/**
 * assessmentRoutes.js — Wellbeing Self-Reflection Endpoints
 *
 * Mounted under /api/assessments:
 *   - POST /api/assessments        (Persists completed 10-area assessment)
 *   - GET  /api/assessments/latest (Returns seeker's latest assessment)
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/rbac.js';
import {
  recordAssessment,
  getLatestAssessment,
} from '../controllers/clientController.js';

const router = Router();

// All assessment persistence endpoints require active session authentication
router.use(requireAuth);

router.post('/', recordAssessment);
router.get('/latest', getLatestAssessment);

export default router;

