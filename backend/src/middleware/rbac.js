/**
 * rbac.js — Role-Based Access Control (RBAC) Middleware
 *
 * Implements strict, server-side authorization:
 * - Authentication & authorization remain completely separate.
 * - Every protected route validates the Better Auth session via HTTP-only cookie or Bearer token.
 * - Roles are NEVER read from client payloads or frontend headers.
 * - Role assignments are queried directly from the trusted Neon PostgreSQL `user_roles` table.
 * - Strict verification guards ensure unverified helpers/professionals cannot access active queues.
 * - Default deny security model.
 */

import { fromNodeHeaders } from 'better-auth/node';
import { auth, authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

/**
 * Validates that an incoming request has an active, valid Better Auth session.
 * Attaches `req.user`, `req.session`, and trusted `req.roles` to the request object.
 */
export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in.',
        code: 'UNAUTHORIZED',
      });
    }

    req.user = session.user;
    req.session = session.session;

    // Fetch trusted roles from NeonDB
    const rolesRes = await authPool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [session.user.id]
    );

    req.roles = rolesRes.rows.map((r) => r.role);

    // If no explicit role is recorded yet, fallback strictly to baseline 'user'
    if (req.roles.length === 0) {
      req.roles = ['user'];
    }

    next();
  } catch (err) {
    logger.error('Session verification error in requireAuth', {
      error: err.message,
    });
    return res.status(500).json({
      success: false,
      error: 'Authentication check failed.',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * Enforces that the authenticated user possesses at least one of the specified roles.
 *
 * @param {...string} allowedRoles Roles permitted (e.g. 'user', 'helper', 'professional', 'admin')
 */
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    // If requireAuth hasn't run yet, run it
    if (!req.user || !req.roles) {
      return requireAuth(req, res, () => {
        return checkUserRole(req, res, next, allowedRoles);
      });
    }

    return checkUserRole(req, res, next, allowedRoles);
  };
}

function checkUserRole(req, res, next, allowedRoles) {
  const hasRole = req.roles.some((r) => allowedRoles.includes(r) || r === 'admin');

  if (!hasRole) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You do not have the required permissions for this resource.',
      code: 'FORBIDDEN',
    });
  }

  next();
}

/**
 * Enforces that the user has the 'helper' role AND has a 'verified' helper_profile.
 * Unverified helpers are blocked from live support queues.
 */
export async function requireVerifiedHelper(req, res, next) {
  if (!req.user || !req.roles) {
    return requireAuth(req, res, () => requireVerifiedHelper(req, res, next));
  }

  // Admins bypass helper verification; all others must be verified helpers
  if (req.roles.includes('admin')) {
    return next();
  }

  if (!req.roles.includes('helper')) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Helper role required.',
      code: 'HELPER_ROLE_REQUIRED',
    });
  }

  try {
    const profileRes = await authPool.query(
      'SELECT verification_status FROM helper_profiles WHERE user_id = $1',
      [req.user.id]
    );

    const helperProfile = profileRes.rows[0];

    if (!helperProfile || helperProfile.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'Helper verification required. Your helper application is pending administrative review.',
        code: 'UNVERIFIED_HELPER',
      });
    }

    req.helperProfile = helperProfile;
    next();
  } catch (err) {
    logger.error('Error in requireVerifiedHelper guard', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Helper authorization check failed.',
      code: 'AUTHORIZATION_ERROR',
    });
  }
}

/**
 * Enforces that the user has the 'professional' role AND has a 'verified' professional_profile.
 * Helpers and general users can NEVER access professional routes.
 */
export async function requireVerifiedProfessional(req, res, next) {
  if (!req.user || !req.roles) {
    return requireAuth(req, res, () => requireVerifiedProfessional(req, res, next));
  }

  // Admins bypass; all others must be verified professionals
  if (req.roles.includes('admin')) {
    return next();
  }

  if (!req.roles.includes('professional')) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Licensed professional credentials required.',
      code: 'PROFESSIONAL_ROLE_REQUIRED',
    });
  }

  try {
    const profRes = await authPool.query(
      'SELECT verification_status FROM professional_profiles WHERE user_id = $1',
      [req.user.id]
    );

    const prof = profRes.rows[0];

    if (!prof || prof.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'Professional license verification required.',
        code: 'UNVERIFIED_PROFESSIONAL',
      });
    }

    req.professionalProfile = prof;
    next();
  } catch (err) {
    logger.error('Error in requireVerifiedProfessional guard', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Professional authorization check failed.',
      code: 'AUTHORIZATION_ERROR',
    });
  }
}

