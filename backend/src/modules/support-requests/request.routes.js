/**
 * request.routes.js — Support Requests REST Routes
 *
 * Implements Section 8.2 API specification.
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/rbac.js';
import {
  createSupportRequest,
  getMySupportRequests,
  getSupportRequestById,
  cancelSupportRequest,
  getMatchStatus,
  rematchSupportRequest,
} from './request.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', createSupportRequest);
router.get('/me', getMySupportRequests);
router.get('/:id', getSupportRequestById);
router.post('/:id/cancel', cancelSupportRequest);
router.get('/:id/match', getMatchStatus);
router.post('/:id/rematch', rematchSupportRequest);

export default router;
