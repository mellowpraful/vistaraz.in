/**
 * request.service.js — Seeker Support Request Service
 *
 * Implements Section 8.2 & Section 11 of the Phase 4 specification.
 * Handles support intake, youth safeguarding gate, crisis safety checks, and matching trigger.
 */

import { authPool } from '../../config/auth.js';
import { MatchingService } from '../matching/matching.service.js';
import { logger } from '../../utils/logger.js';

// Urgent crisis indicator patterns
const CRISIS_PATTERNS = [
  /\b(suicid|kill myself|end my life|end it all|want to die|self[- ]harm|hanging myself|overdose)\b/i,
];

export class RequestService {
  /**
   * Evaluates text for imminent self-harm or acute crisis indicators.
   */
  static isCrisisInput(text, urgency) {
    if (urgency === 'crisis') return true;
    if (!text || typeof text !== 'string') return false;
    return CRISIS_PATTERNS.some((p) => p.test(text));
  }

  /**
   * Creates a new support request.
   */
  static async createRequest(userId, data) {
    const {
      category = 'general_wellbeing',
      concernDescription = '',
      preferredLanguage = 'en',
      communicationMode = 'text',
      preferredTimeStart = null,
      preferredTimeEnd = null,
      ageBand = '18-20',
      privacyMode = 'private',
      urgency = 'medium',
    } = data;

    // 1. Age band validation
    const validAgeBands = ['15-17', '18-20', '21-25'];
    if (!validAgeBands.includes(ageBand)) {
      throw new Error(`Invalid age band. Must be one of: ${validAgeBands.join(', ')}`);
    }

    // 2. Minor Safeguarding Gate (Phase 4F / Section 11.2)
    if (ageBand === '15-17') {
      logger.warn(`Minor support request created by user [${userId}] — held under Section 11.2.`);
      // Insert with safeguarding status
      const res = await authPool.query(
        `INSERT INTO support_requests (
           user_id, category, concern_description, preferred_language,
           communication_mode, preferred_time_start, preferred_time_end,
           age_band, privacy_mode, urgency, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'safety_check')
         RETURNING *`,
        [
          userId,
          category,
          concernDescription.slice(0, 2000),
          preferredLanguage,
          communicationMode,
          preferredTimeStart,
          preferredTimeEnd,
          ageBand,
          privacyMode,
          urgency,
        ]
      );

      // Create a safeguarding review record
      await authPool.query(
        `INSERT INTO safeguarding_cases (seeker_user_id, age_band, risk_level, case_notes, status)
         VALUES ($1, $2, 'moderate', 'Minor peer support request initiated. Gated under controlled youth protection policy.', 'opened')`,
        [userId, ageBand]
      );

      return {
        request: res.rows[0],
        safeguarded: true,
        isMinorGate: true,
        message:
          'Peer support matching for individuals aged 15–17 is currently in controlled pilot preparation. ' +
          'For immediate, free, 24/7 confidential professional guidance, dedicated national services are available:\n' +
          '• Childline India: 1098\n' +
          '• Tele-MANAS (Govt of India): 14416 / 1800-891-4416\n' +
          '• Vandrevala Foundation: 9999 666 555\n' +
          '• KIRAN Mental Health Helpline: 1800-599-0019',
      };
    }

    // 3. Imminent Crisis Detection
    const isCrisis = this.isCrisisInput(concernDescription, urgency);
    if (isCrisis) {
      logger.warn(`Imminent crisis detected in support request for user [${userId}].`);
      const res = await authPool.query(
        `INSERT INTO support_requests (
           user_id, category, concern_description, preferred_language,
           communication_mode, preferred_time_start, preferred_time_end,
           age_band, privacy_mode, urgency, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'crisis', 'escalated')
         RETURNING *`,
        [
          userId,
          category,
          concernDescription.slice(0, 2000),
          preferredLanguage,
          communicationMode,
          preferredTimeStart,
          preferredTimeEnd,
          ageBand,
          privacyMode,
        ]
      );

      await authPool.query(
        `INSERT INTO safeguarding_cases (seeker_user_id, age_band, risk_level, case_notes, status)
         VALUES ($1, $2, 'high', 'Immediate crisis keywords identified. Self-guided peer matching stopped. Emergency resources provided.', 'escalated')`,
        [userId, ageBand]
      );

      return {
        request: res.rows[0],
        crisisIntervention: true,
        message:
          'If you are in acute distress or feeling unsafe, please reach out to immediate emergency care:\n' +
          '• Tele-MANAS (24/7 Toll-Free): 14416\n' +
          '• Vandrevala Foundation (24/7 Crisis Support): +91 9999 666 555\n' +
          '• KIRAN Helpline: 1800-599-0019\n' +
          '• National Emergency Number: 112',
      };
    }

    // 4. Standard Support Request
    const res = await authPool.query(
      `INSERT INTO support_requests (
         user_id, category, concern_description, preferred_language,
         communication_mode, preferred_time_start, preferred_time_end,
         age_band, privacy_mode, urgency, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'matching')
       RETURNING *`,
      [
        userId,
        category,
        concernDescription.slice(0, 2000),
        preferredLanguage,
        communicationMode,
        preferredTimeStart,
        preferredTimeEnd,
        ageBand,
        privacyMode,
        urgency,
      ]
    );

    const request = res.rows[0];

    // Trigger asynchronous matching
    let matchResult = null;
    try {
      matchResult = await MatchingService.findAndOfferMatch(request.id);
    } catch (err) {
      logger.error('Error triggering initial match', { error: err.message });
    }

    return {
      request,
      matchResult,
    };
  }

  /**
   * Retrieves all requests for the authenticated seeker.
   */
  static async getMyRequests(userId) {
    const res = await authPool.query(
      `SELECT sr.*, 
              (
                SELECT ss.id 
                FROM support_sessions ss 
                WHERE ss.support_request_id = sr.id 
                ORDER BY ss.created_at DESC 
                LIMIT 1
              ) as active_session_id
       FROM support_requests sr
       WHERE sr.user_id = $1
       ORDER BY sr.created_at DESC`,
      [userId]
    );

    return res.rows;
  }

  /**
   * Retrieves single request details, verifying ownership.
   */
  static async getRequestById(userId, requestId) {
    const res = await authPool.query(
      `SELECT sr.*, 
              (
                SELECT ss.id 
                FROM support_sessions ss 
                WHERE ss.support_request_id = sr.id 
                ORDER BY ss.created_at DESC 
                LIMIT 1
              ) as active_session_id
       FROM support_requests sr
       WHERE sr.id = $1 AND sr.user_id = $2`,
      [requestId, userId]
    );

    return res.rows[0] || null;
  }

  /**
   * Cancels a pending support request.
   */
  static async cancelRequest(userId, requestId) {
    const res = await authPool.query(
      `UPDATE support_requests
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status IN ('open', 'requested', 'matching', 'offered')
       RETURNING *`,
      [requestId, userId]
    );

    if (res.rows.length === 0) {
      throw new Error('Request cannot be cancelled or is not in a cancellable state.');
    }

    // Cancel any pending candidate offers
    await authPool.query(
      `UPDATE match_candidates SET offer_status = 'expired' WHERE request_id = $1 AND offer_status IN ('pending', 'offered')`,
      [requestId]
    );

    return res.rows[0];
  }

  /**
   * Safe match status for seeker UI (no listener private identity leaked).
   */
  static async getMatchStatus(userId, requestId) {
    const request = await this.getRequestById(userId, requestId);
    if (!request) {
      throw new Error('Request not found.');
    }

    // If matched, fetch assigned listener alias
    if (request.status === 'matched') {
      const matchRes = await authPool.query(
        `SELECT sa.assignment_status, sa.accepted_at,
                hp.display_alias, hp.languages, hp.verification_status,
                ss.id as session_id, ss.session_status, ss.session_type
         FROM support_assignments sa
         JOIN helper_profiles hp ON hp.id = sa.supporter_id
         LEFT JOIN support_sessions ss ON ss.assignment_id = sa.id
         WHERE sa.request_id = $1`,
        [requestId]
      );

      const match = matchRes.rows[0];
      return {
        status: 'matched',
        supporter: {
          alias: match?.display_alias || 'Verified Peer Listener',
          languages: match?.languages || ['en'],
          isVerified: true,
        },
        sessionId: match?.session_id,
        sessionStatus: match?.session_status,
        sessionType: match?.session_type,
        acceptedAt: match?.accepted_at,
      };
    }

    if (request.status === 'offered') {
      return {
        status: 'offering',
        message: 'A suitable peer listener has been identified and an offer has been dispatched. Waiting for confirmation.',
      };
    }

    if (request.status === 'matching') {
      return {
        status: 'matching',
        message: 'Currently matching your request with active, verified peer listeners in your preferred language.',
      };
    }

    return {
      status: request.status,
      message: `Request status: ${request.status}`,
    };
  }

  /**
   * Request a rematch if previous offers were declined or unfulfilled.
   */
  static async rematch(userId, requestId) {
    const request = await this.getRequestById(userId, requestId);
    if (!request) {
      throw new Error('Request not found.');
    }

    if (request.status === 'matched') {
      throw new Error('Request is already matched to an active listener.');
    }

    await authPool.query(
      `UPDATE support_requests SET status = 'matching', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [requestId]
    );

    return MatchingService.findAndOfferMatch(requestId);
  }
}
