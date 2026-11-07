/**
 * authController.js — Additional Authentication & Profile Handlers
 *
 * Provides:
 * - GET /api/auth/me: Returns current authenticated user, sanitized profile, and trusted roles.
 * - POST /api/auth/declare-role: Allows users to choose between 'user' and 'helper' during onboarding.
 *   Strictly rejects self-assignment of 'admin' or 'professional' roles.
 */

import { authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile and roles.
 * Never leaks password hashes, tokens, or internal credentials.
 */
export async function getMe(req, res) {
  try {
    const user = req.user;
    const roles = req.roles || ['user'];

    // Fetch sanctuary profile
    const profileRes = await authPool.query(
      `SELECT display_name, nickname, avatar_url, preferred_language, privacy_preferences, bio
       FROM profiles
       WHERE user_id = $1`,
      [user.id]
    );

    const profile = profileRes.rows[0] || {
      display_name: user.name,
      nickname: (user.name || '').split(' ')[0],
      preferred_language: 'en',
    };

    // If helper, fetch verification status
    let helperStatus = null;
    if (roles.includes('helper')) {
      const helperRes = await authPool.query(
        'SELECT verification_status, application_status FROM helper_profiles WHERE user_id = $1',
        [user.id]
      );
      helperStatus = helperRes.rows[0] || { verification_status: 'none', application_status: 'unsubmitted' };
    }

    // If professional, fetch professional status
    let professionalStatus = null;
    if (roles.includes('professional')) {
      const profRes = await authPool.query(
        'SELECT verification_status, approval_status, title FROM professional_profiles WHERE user_id = $1',
        [user.id]
      );
      professionalStatus = profRes.rows[0] || { verification_status: 'none', approval_status: 'unsubmitted' };
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        roles,
        profile,
        helper: helperStatus,
        professional: professionalStatus,
      },
    });
  } catch (err) {
    logger.error('Failed to retrieve user profile in getMe', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/auth/declare-role
 * Allows newly registered users to select their onboarding purpose ('user' or 'helper').
 *
 * SECURITY:
 * Rejects any request attempting to assign 'admin' or 'professional'.
 */
export async function declareRole(req, res) {
  try {
    const { role, helperDetails } = req.body;
    const userId = req.user.id;

    // Strict validation of allowed public roles
    if (!['user', 'helper'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Privileged roles (admin, professional) cannot be self-assigned.',
        code: 'PRIVILEGE_ESCALATION_BLOCKED',
      });
    }

    // 1. Assign role
    await authPool.query(
      `INSERT INTO user_roles (user_id, role)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role) DO NOTHING`,
      [userId, role]
    );

    // 2. If helper, create pending helper application
    if (role === 'helper') {
      const intro = helperDetails?.introduction || '';
      const qualification = helperDetails?.qualification || 'Aspiring Peer Listener';
      const languages = Array.isArray(helperDetails?.languages) ? helperDetails.languages : ['en'];

      await authPool.query(
        `INSERT INTO helper_profiles (user_id, introduction, qualification, languages, verification_status, application_status)
         VALUES ($1, $2, $3, $4, 'pending', 'submitted')
         ON CONFLICT (user_id) DO UPDATE SET
           introduction = EXCLUDED.introduction,
           qualification = EXCLUDED.qualification,
           languages = EXCLUDED.languages,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, intro, qualification, languages]
      );
    }

    return res.status(200).json({
      success: true,
      message: `Role '${role}' assigned successfully.`,
      data: {
        role,
        status: role === 'helper' ? 'pending_verification' : 'active',
      },
    });
  } catch (err) {
    logger.error('Failed to assign onboarding role', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to assign role.',
      code: 'SERVER_ERROR',
    });
  }
}

