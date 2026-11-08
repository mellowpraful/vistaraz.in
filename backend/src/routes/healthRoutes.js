/**
 * healthRoutes.js — Health-check route definitions
 *
 * Mounted at /api/health in app.js:
 *   - GET /api/health    -> getHealth
 *   - GET /api/health/db -> getDbHealth
 */

import { Router } from 'express';
import { getHealth, getDbHealth } from '../controllers/healthController.js';

const router = Router();

/**
 * GET /api/health
 * Public. Verifies API server process status.
 */
router.get('/', getHealth);

/**
 * GET /api/health/db
 * Public. Verifies live NeonDB connectivity.
 */
router.get('/db', getDbHealth);

export default router;
