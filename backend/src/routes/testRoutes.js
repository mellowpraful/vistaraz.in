/**
 * testRoutes.js — RBAC Verification Endpoints
 *
 * Dedicated test routes to verify server-side authorization boundaries:
 * - User role access
 * - Helper role access
 * - Unverified helper rejection (Live Listener Portal simulation)
 * - Professional role access
 * - Unverified professional rejection
 * - Admin-only route protection
 */

import { Router } from 'express';
import {
  requireAuth,
  requireRole,
  requireVerifiedHelper,
  requireVerifiedProfessional,
} from '../middleware/rbac.js';

const router = Router();

// 1. General authenticated user
router.get('/protected/user', requireRole('user'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Support Seeker sanctuary dashboard.',
    user: { id: req.user.id, email: req.user.email, roles: req.roles },
  });
});

// 2. Helper role (unverified or verified)
router.get('/protected/helper', requireRole('helper'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Helper portal overview.',
    user: { id: req.user.id, roles: req.roles },
  });
});

// 3. Verified Listener Portal (strictly blocks unverified helpers)
router.get('/protected/verified-listener', requireVerifiedHelper, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to Live Listener active queue.',
    user: { id: req.user.id, roles: req.roles },
  });
});

// 4. Professional role (unverified or verified)
router.get('/protected/professional', requireRole('professional'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Professional portal.',
    user: { id: req.user.id, roles: req.roles },
  });
});

// 5. Verified Professional Portal
router.get('/protected/verified-professional', requireVerifiedProfessional, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to Clinical Case Management portal.',
    user: { id: req.user.id, roles: req.roles },
  });
});

// 6. Admin Portal
router.get('/protected/admin', requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Vistaraz Admin Management Console.',
    user: { id: req.user.id, roles: req.roles },
  });
});

export default router;

