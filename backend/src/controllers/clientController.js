/**
 * clientController.js — Client Care Panel & Seeker Dashboard Handlers
 *
 * Implements server-side handlers for authenticated Support Seekers:
 * - GET  /api/users/me/dashboard-stats (aggregated real counts and recent reflection state)
 * - GET  /api/users/me/sessions        (user's support sessions from support_sessions)
 * - POST /api/users/me/moods           (persists daily mood check-in to assessments table)
 * - GET  /api/users/me/moods/latest    (retrieves seeker's latest mood check-in)
 * - POST /api/assessments              (persists completed 10-area wellbeing check-in)
 * - GET  /api/assessments/latest       (retrieves seeker's latest wellbeing assessment)
 *
 * All operations strictly enforce `req.user.id` isolation from Better Auth session cookies.
 */

import { authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

// Valid mood dictionary with sanctuary messaging & emojis
const VALID_MOODS = {
  low: {
    key: 'low',
    label: 'Low',
    emoji: '🌧️',
    score: 1,
    message: "That's okay. You reached out — that takes courage. 💙",
  },
  tense: {
    key: 'tense',
    label: 'Tense',
    emoji: '🌊',
    score: 2,
    message: 'Feeling tense is normal. A breathing tool might help right now.',
  },
  okay: {
    key: 'okay',
    label: 'Okay',
    emoji: '🌿',
    score: 3,
    message: "Okay is a good place to be. Let's keep you supported.",
  },
  good: {
    key: 'good',
    label: 'Good',
    emoji: '☀️',
    score: 4,
    message: 'Wonderful! Keep nurturing that positive energy.',
  },
  bright: {
    key: 'bright',
    label: 'Bright',
    emoji: '✨',
    score: 5,
    message: "You're shining today! That energy is worth celebrating. ✨",
  },
};

/**
 * Normalizes input mood string to lowercase key
 * @param {any} input
 * @returns {string|null}
 */
function normalizeMoodKey(input) {
  if (typeof input !== 'string') return null;
  const key = input.trim().toLowerCase();
  return VALID_MOODS[key] ? key : null;
}

/**
 * GET /api/users/me/dashboard-stats
 * Aggregates live database metrics for the authenticated seeker.
 */
export async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    // 1. Session counts (completed vs upcoming)
    const sessionCountsRes = await authPool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE session_status = 'completed')::int AS total_completed,
         COUNT(*) FILTER (WHERE session_status IN ('scheduled', 'active'))::int AS upcoming_count
       FROM support_sessions
       WHERE user_id = $1`,
      [userId]
    );
    const sessionCounts = sessionCountsRes.rows[0] || { total_completed: 0, upcoming_count: 0 };

    // 2. Pending support requests count
    const pendingReqRes = await authPool.query(
      `SELECT COUNT(*)::int AS pending_requests
       FROM support_requests
       WHERE user_id = $1 AND status IN ('open', 'matched')`,
      [userId]
    );
    const pendingRequestsCount = pendingReqRes.rows[0]?.pending_requests || 0;

    // 3. Mood check-in count & latest mood
    const moodCountRes = await authPool.query(
      `SELECT COUNT(*)::int AS total_moods
       FROM assessments
       WHERE user_id = $1 AND assessment_type = 'daily_mood'`,
      [userId]
    );
    const totalMoods = moodCountRes.rows[0]?.total_moods || 0;

    const latestMoodRes = await authPool.query(
      `SELECT id, responses, completed_at, created_at
       FROM assessments
       WHERE user_id = $1 AND assessment_type = 'daily_mood'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId]
    );

    let latestMood = null;
    if (latestMoodRes.rows.length > 0) {
      const row = latestMoodRes.rows[0];
      const resp = row.responses || {};
      latestMood = {
        id: row.id,
        mood: resp.mood || 'okay',
        label: resp.label || 'Okay',
        emoji: resp.emoji || '🌿',
        message: resp.message || '',
        completedAt: row.completed_at || row.created_at,
      };
    }

    // 4. Assessment count & latest wellbeing reflection
    const assessCountRes = await authPool.query(
      `SELECT COUNT(*)::int AS total_assessments
       FROM assessments
       WHERE user_id = $1 AND assessment_type = 'wellbeing_checkin'`,
      [userId]
    );
    const totalAssessments = assessCountRes.rows[0]?.total_assessments || 0;

    const latestAssessRes = await authPool.query(
      `SELECT id, responses, result_summary, completed_at, created_at
       FROM assessments
       WHERE user_id = $1 AND assessment_type = 'wellbeing_checkin'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId]
    );

    let latestAssessment = null;
    if (latestAssessRes.rows.length > 0) {
      const row = latestAssessRes.rows[0];
      const summary = row.result_summary || {};
      latestAssessment = {
        id: row.id,
        score: summary.score ?? null,
        percentage: summary.percentage ?? null,
        tierTitle: summary.tierTitle || 'Wellbeing Reflection',
        categoryScores: summary.categoryScores || {},
        completedAt: row.completed_at || row.created_at,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        totalCompletedSessions: sessionCounts.total_completed,
        upcomingSessionsCount: sessionCounts.upcoming_count,
        pendingRequestsCount: pendingRequestsCount,
        totalMoodCheckins: totalMoods,
        latestMood,
        assessmentCount: totalAssessments,
        latestAssessment,
        plan: {
          tier: 'Free',
          name: 'Free Sanctuary Member',
          status: 'active',
        },
      },
    });
  } catch (err) {
    logger.error('Failed to get dashboard stats', { error: err.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/users/me/sessions
 * Returns real session history for the authenticated seeker from `support_sessions`.
 */
export async function getMySessions(req, res) {
  try {
    const userId = req.user.id;

    const queryRes = await authPool.query(
      `SELECT 
         s.id,
         s.session_type,
         s.session_status,
         s.scheduled_for,
         s.started_at,
         s.ended_at,
         s.created_at,
         u.name AS helper_name,
         hp.qualification AS helper_qualification,
         p.avatar_id AS helper_avatar_id
       FROM support_sessions s
       LEFT JOIN "user" u ON s.assigned_peer_id = u.id
       LEFT JOIN helper_profiles hp ON s.assigned_peer_id = hp.user_id
       LEFT JOIN profiles p ON s.assigned_peer_id = p.user_id
       WHERE s.user_id = $1
       ORDER BY COALESCE(s.scheduled_for, s.created_at) DESC`,
      [userId]
    );

    const sessions = queryRes.rows.map((row) => ({
      id: row.id,
      sessionType: row.session_type,
      sessionStatus: row.session_status,
      scheduledFor: row.scheduled_for,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      createdAt: row.created_at,
      helperName: row.helper_name || 'Assigned Peer Supporter',
      helperQualification: row.helper_qualification || null,
      helperAvatarId: row.helper_avatar_id || null,
    }));

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    logger.error('Failed to get seeker sessions', { error: err.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve sessions.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/users/me/moods
 * Records a daily mood check-in for the authenticated seeker in `assessments`.
 */
export async function recordMood(req, res) {
  try {
    const userId = req.user.id;
    const { mood, note } = req.body;

    const moodKey = normalizeMoodKey(mood);
    if (!moodKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood value. Must be one of: Low, Tense, Okay, Good, Bright.',
        code: 'VALIDATION_ERROR',
      });
    }

    const config = VALID_MOODS[moodKey];
    const payloadResponses = {
      mood: config.key,
      label: config.label,
      emoji: config.emoji,
      message: config.message,
      note: typeof note === 'string' ? note.slice(0, 500).trim() : null,
    };

    const payloadSummary = {
      mood: config.key,
      score: config.score,
    };

    const insertRes = await authPool.query(
      `INSERT INTO assessments (user_id, assessment_type, responses, result_summary, completed_at)
       VALUES ($1, 'daily_mood', $2, $3, NOW())
       RETURNING id, responses, result_summary, completed_at, created_at`,
      [userId, JSON.stringify(payloadResponses), JSON.stringify(payloadSummary)]
    );

    const row = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: row.id,
        mood: config.key,
        label: config.label,
        emoji: config.emoji,
        message: config.message,
        note: payloadResponses.note,
        completedAt: row.completed_at,
      },
    });
  } catch (err) {
    logger.error('Failed to record mood', { error: err.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Failed to record mood check-in.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/users/me/moods/latest
 * Returns the seeker's most recent mood check-in.
 */
export async function getLatestMood(req, res) {
  try {
    const userId = req.user.id;

    const queryRes = await authPool.query(
      `SELECT id, responses, completed_at, created_at
       FROM assessments
       WHERE user_id = $1 AND assessment_type = 'daily_mood'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId]
    );

    if (queryRes.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const row = queryRes.rows[0];
    const resp = row.responses || {};

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        mood: resp.mood,
        label: resp.label,
        emoji: resp.emoji,
        message: resp.message,
        note: resp.note || null,
        completedAt: row.completed_at || row.created_at,
      },
    });
  } catch (err) {
    logger.error('Failed to get latest mood', { error: err.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest mood.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * Category names for the 10-Area non-diagnostic assessment
 */
const CATEGORY_NAMES = {
  1: 'Current Mood',
  2: 'Anxiety & Tension',
  3: 'Sleep Quality',
  4: 'Stress & Overwhelm',
  5: 'Physical Energy',
  6: 'Academic & Work Pressure',
  7: 'Social Support & Connection',
  8: 'Concentration & Focus',
  9: 'Social Comfort',
  10: 'General Emotional State',
};

/**
 * POST /api/assessments
 * Persists a completed 10-area wellbeing check-in.
 * Treated strictly as non-diagnostic self-reflection.
 */
export async function recordAssessment(req, res) {
  try {
    const userId = req.user.id;
    const { answers, resultTier } = req.body;

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assessment data: answers object is required.',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate that at least answers exist and scores are numbers 1 to 5
    const validatedAnswers = {};
    const categoryScores = {};
    let totalScore = 0;
    let answerCount = 0;

    for (const [key, val] of Object.entries(answers)) {
      const qNum = parseInt(key, 10);
      const score = Number(val);
      if (isNaN(qNum) || qNum < 1 || qNum > 10) continue;
      if (isNaN(score) || score < 1 || score > 5) {
        return res.status(400).json({
          success: false,
          error: `Invalid score for question ${qNum}. Score must be between 1 and 5.`,
          code: 'VALIDATION_ERROR',
        });
      }
      validatedAnswers[qNum] = score;
      const catName = CATEGORY_NAMES[qNum] || `Area ${qNum}`;
      categoryScores[catName] = {
        score,
        percentage: Math.round((score / 5) * 100),
      };
      totalScore += score;
      answerCount++;
    }

    if (answerCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Assessment must contain at least one valid question response.',
        code: 'VALIDATION_ERROR',
      });
    }

    const maxScore = answerCount * 5;
    const percentage = Math.round((totalScore / maxScore) * 100);

    let tierTitle = resultTier?.title || 'Balanced & Grounded';
    if (!resultTier?.title) {
      if (percentage < 45) {
        tierTitle = 'Tender & In Need of Gentle Care';
      } else if (percentage < 70) {
        tierTitle = 'Navigating Stress with Resilience';
      } else {
        tierTitle = 'Balanced & Grounded';
      }
    }

    const resultSummary = {
      score: totalScore,
      maxPossible: maxScore,
      percentage,
      tierTitle,
      categoryScores,
      isNonDiagnostic: true,
      clinicalNotice: 'Non-diagnostic self-reflection. Not a medical or psychiatric diagnosis.',
    };

    const insertRes = await authPool.query(
      `INSERT INTO assessments (user_id, assessment_type, responses, result_summary, completed_at)
       VALUES ($1, 'wellbeing_checkin', $2, $3, NOW())
       RETURNING id, responses, result_summary, completed_at, created_at`,
      [userId, JSON.stringify(validatedAnswers), JSON.stringify(resultSummary)]
    );

    const row = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: row.id,
        assessmentType: 'wellbeing_checkin',
        percentage,
        tierTitle,
        categoryScores,
        completedAt: row.completed_at,
      },
    });
  } catch (err) {
    logger.error('Failed to record assessment', { error: err.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Failed to record assessment.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/assessments/latest
 * Returns the seeker's most recent 10-area wellbeing check-in.
 */
export async function getLatestAssessment(req, res) {
  try {
    const userId = req.user.id;

    const queryRes = await authPool.query(
      `SELECT id, responses, result_summary, completed_at, created_at
       FROM assessments
       WHERE user_id = $1 AND assessment_type = 'wellbeing_checkin'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [userId]
    );

    if (queryRes.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const row = queryRes.rows[0];
    const summary = row.result_summary || {};

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        score: summary.score ?? null,
        percentage: summary.percentage ?? null,
        tierTitle: summary.tierTitle || 'Wellbeing Reflection',
        categoryScores: summary.categoryScores || {},
        completedAt: row.completed_at || row.created_at,
      },
    });
  } catch (err) {
    logger.error('Failed to get latest assessment', { error: err.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment.',
      code: 'SERVER_ERROR',
    });
  }
}

