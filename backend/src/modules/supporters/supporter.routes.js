/**
 * supporter.routes.js — Peer Supporter REST API Routes
 *
 * Implements Section 8.1 API specification.
 * Requires Better Auth authentication and verified helper authorization.
 */

import { Router } from 'express';
import { requireAuth, requireRole, requireVerifiedHelper } from '../../middleware/rbac.js';
import {
  getMySupporterProfile,
  updateMySupporterProfile,
  getMySupporterStatus,
  updateMyAvailability,
  getMyOffers,
  acceptOffer,
  declineOffer,
} from './supporter.controller.js';

const router = Router();

// All supporter routes require authentication
router.use(requireAuth);

// Status check (available to any user with 'helper' role)
router.get('/me/status', requireRole('helper', 'admin'), getMySupporterStatus);

// Profile view & update (available to helpers)
router.get('/me', requireRole('helper', 'admin'), getMySupporterProfile);
router.put('/me', requireRole('helper', 'admin'), updateMySupporterProfile);

// Availability & active queue management (requires verified helper)
router.put('/me/availability', requireVerifiedHelper, updateMyAvailability);
router.get('/me/requests', requireVerifiedHelper, getMyOffers);
router.post('/me/requests/:id/accept', requireVerifiedHelper, acceptOffer);
router.post('/me/requests/:id/decline', requireVerifiedHelper, declineOffer);

export default router;
