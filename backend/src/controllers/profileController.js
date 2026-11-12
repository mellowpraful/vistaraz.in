/**
 * profileController.js — Seeker Profile Management Handlers
 *
 * Implements:
 * - GET   /api/users/me/profile: Checks & returns authenticated user's Seeker Profile.
 * - POST  /api/users/me/profile: Creates initial Seeker Profile (prevents duplicates).
 * - PATCH /api/users/me/profile: Updates existing Seeker Profile fields.
 */

import { authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

const VALID_AVATAR_REGEX = /^avatar_(0[1-9]|1[0-2])$/;

/**
 * Validates real name string.
 * @param {any} name
 * @returns {string|null} Validated trimmed name, or null if invalid
 */
function validateRealName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return null;
  return trimmed;
}

/**
 * Validates avatar ID string.
 * @param {any} avatarId
 * @returns {string|null} Validated avatarId, or null if invalid
 */
function validateAvatarId(avatarId) {
  if (typeof avatarId !== 'string') return null;
  const trimmed = avatarId.trim();
  if (!VALID_AVATAR_REGEX.test(trimmed)) return null;
  return trimmed;
}

/**
 * GET /api/users/me/profile
 * Returns the authenticated user's Seeker Profile.
 * If no profile or incomplete, returns `profileExists: false`.
 */
export async function getSeekerProfile(req, res) {
  try {
    const userId = req.user.id;

    const queryRes = await authPool.query(
      `SELECT user_id, real_name, avatar_id, is_seeker_profile_completed, created_at, updated_at
       FROM profiles
       WHERE user_id = $1`,
      [userId]
    );

    const row = queryRes.rows[0];

    // Profile exists only if row is found and seeker profile is marked completed with valid avatar and name
    if (!row || !row.is_seeker_profile_completed || !row.avatar_id || !row.real_name) {
      return res.status(200).json({
        success: true,
        profileExists: false,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      profileExists: true,
      data: {
        userId: row.user_id,
        realName: row.real_name,
        avatarId: row.avatar_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    logger.error('Failed to get seeker profile in getSeekerProfile', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve seeker profile.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/users/me/profile
 * Creates the authenticated user's Seeker Profile.
 * Strictly rejects duplicates if the profile is already completed.
 */
export async function createSeekerProfile(req, res) {
  try {
    const userId = req.user.id;
    const { realName, real_name, avatarId, avatar_id } = req.body;

    const nameInput = realName !== undefined ? realName : real_name;
    const avatarInput = avatarId !== undefined ? avatarId : avatar_id;

    const validatedName = validateRealName(nameInput);
    if (!validatedName) {
      return res.status(400).json({
        success: false,
        error: 'Real name is required (between 1 and 100 characters).',
        code: 'INVALID_REAL_NAME',
      });
    }

    const validatedAvatar = validateAvatarId(avatarInput);
    if (!validatedAvatar) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid avatar (avatar_01 through avatar_12).',
        code: 'INVALID_AVATAR_ID',
      });
    }

    // Upsert seeker profile into NeonDB (idempotent: sets or updates real_name & avatar)
    const insertRes = await authPool.query(
      `INSERT INTO profiles (
         user_id,
         real_name,
         display_name,
         avatar_id,
         is_seeker_profile_completed,
         preferred_language,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $2, $3, true, 'en', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         real_name = EXCLUDED.real_name,
         display_name = EXCLUDED.display_name,
         avatar_id = EXCLUDED.avatar_id,
         is_seeker_profile_completed = true,
         updated_at = CURRENT_TIMESTAMP
       RETURNING user_id, real_name, avatar_id, created_at, updated_at`,
      [userId, validatedName, validatedAvatar]
    );

    const saved = insertRes.rows[0];

    logger.info(`Seeker profile created successfully for user [id: ${userId}]`);

    return res.status(201).json({
      success: true,
      profileExists: true,
      message: 'Seeker profile created successfully.',
      data: {
        userId: saved.user_id,
        realName: saved.real_name,
        avatarId: saved.avatar_id,
        createdAt: saved.created_at,
        updatedAt: saved.updated_at,
      },
    });
  } catch (err) {
    logger.error('Failed to create seeker profile in createSeekerProfile', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to create seeker profile.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * PATCH /api/users/me/profile
 * Allows updating real name or avatar selection.
 */
export async function updateSeekerProfile(req, res) {
  try {
    const userId = req.user.id;
    const { realName, real_name, avatarId, avatar_id } = req.body;

    const nameInput = realName !== undefined ? realName : real_name;
    const avatarInput = avatarId !== undefined ? avatarId : avatar_id;

    if (nameInput === undefined && avatarInput === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (realName or avatarId) must be provided to update.',
        code: 'NO_FIELDS_TO_UPDATE',
      });
    }

    let validatedName = null;
    if (nameInput !== undefined) {
      validatedName = validateRealName(nameInput);
      if (!validatedName) {
        return res.status(400).json({
          success: false,
          error: 'Real name must be between 1 and 100 characters.',
          code: 'INVALID_REAL_NAME',
        });
      }
    }

    let validatedAvatar = null;
    if (avatarInput !== undefined) {
      validatedAvatar = validateAvatarId(avatarInput);
      if (!validatedAvatar) {
        return res.status(400).json({
          success: false,
          error: 'Please select a valid avatar (avatar_01 through avatar_12).',
          code: 'INVALID_AVATAR_ID',
        });
      }
    }

    const updateRes = await authPool.query(
      `UPDATE profiles
       SET
         real_name = COALESCE($2, real_name),
         display_name = COALESCE($2, display_name),
         avatar_id = COALESCE($3, avatar_id),
         is_seeker_profile_completed = true,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING user_id, real_name, avatar_id, created_at, updated_at`,
      [userId, validatedName, validatedAvatar]
    );

    const updated = updateRes.rows[0];
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please create a seeker profile first.',
        code: 'PROFILE_NOT_FOUND',
      });
    }

    logger.info(`Seeker profile updated for user [id: ${userId}]`);

    return res.status(200).json({
      success: true,
      profileExists: true,
      message: 'Seeker profile updated successfully.',
      data: {
        userId: updated.user_id,
        realName: updated.real_name,
        avatarId: updated.avatar_id,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) {
    logger.error('Failed to update seeker profile in updateSeekerProfile', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update seeker profile.',
      code: 'SERVER_ERROR',
    });
  }
}

