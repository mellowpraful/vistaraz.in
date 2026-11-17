/**
 * adminRoutes.js — Protected Admin Portal Routes
 *
 * All routes mounted here strictly require:
 * 1. Valid Better Auth session (requireAuth)
 * 2. Trusted server-verified 'admin' role (requireRole('admin'))
 */

import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import {
  getAdminStats,
  getSeekers,
  getListenerApplications,
  getListenerApplicationDetails,
  reviewListenerApplication,
  getInternApplications,
  getInternApplicationDetails,
  reviewInternApplication,
  getProfessionals,
  getSupportSessions,
  getAuditReports,
  getAdminSupporters,
  getAdminSupporterById,
  verifyAdminSupporter,
  suspendAdminSupporter,
  getAdminSupportRequests,
  getAdminAssignments,
  getAdminSafeguardingCases,
  updateAdminSafeguardingCase,
  getAdminSupportMetrics,
} from '../controllers/adminController.js';

const router = Router();

// Strict security perimeter: require authentication and admin role for all routes in this router
router.use(requireAuth);
router.use(requireRole('admin'));

// 1. Overview metrics
router.get('/stats', getAdminStats);
router.get('/support-metrics', getAdminSupportMetrics);

// 2. Seeker Management
router.get('/seekers', getSeekers);

// 3. Listener / Supporter Management & Applications
router.get('/supporters', getAdminSupporters);
router.get('/supporters/:id', getAdminSupporterById);
router.patch('/supporters/:id/verify', verifyAdminSupporter);
router.patch('/supporters/:id/suspend', suspendAdminSupporter);

// Section 9.6 aliases
router.get('/listeners', getAdminSupporters);
router.get('/listeners/:id', getAdminSupporterById);
router.patch('/listeners/:id/verify', verifyAdminSupporter);
router.patch('/listeners/:id/suspend', suspendAdminSupporter);

router.get('/listeners/applications', getListenerApplications);
router.get('/listeners/applications/:id', getListenerApplicationDetails);
router.post('/listeners/applications/:id/review', reviewListenerApplication);

// 4. Intern Applications
router.get('/interns/applications', getInternApplications);
router.get('/interns/applications/:id', getInternApplicationDetails);
router.post('/interns/applications/:id/review', reviewInternApplication);

// 5. Professional Accounts
router.get('/professionals', getProfessionals);

// 6. Support Requests & Assignments Monitoring
router.get('/support-requests', getAdminSupportRequests);
router.get('/assignments', getAdminAssignments);
router.get('/sessions', getSupportSessions);

// 7. Safeguarding Operations
router.get('/safeguarding-cases', getAdminSafeguardingCases);
router.patch('/safeguarding-cases/:id', updateAdminSafeguardingCase);

// 8. Audit Reports
router.get('/reports', getAuditReports);

export default router;

