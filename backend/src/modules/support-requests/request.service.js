/**
 * request.service.js — Seeker Support Request Service
 *
 * Implements Section 8.2 & Section 11 of the Phase 4 specification.
 * Handles support intake, youth safeguarding gate, crisis safety checks, and matching trigger.
 */

import { authPool } from '../../config/auth.js';
import { MatchingService } from '../matching/matching.service.js';
import { env } from '../../config/env.js';
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

    // 1. Age band validation & normalization ('15_17' -> '15-17')
    const normalizedAgeBand = (ageBand || '18-20').replace('_', '-');
    const validAgeBands = ['15-17', '18-20', '21-25'];
    if (!validAgeBands.includes(normalizedAgeBand)) {
      throw new Error(`Invalid age band. Must be one of: 15-17 (15_17), 18-20 (18_20), 21-25 (21_25)`);
    }

    // 2. Minor Safeguarding Gate (Phase 4F / Section 5 & 11.2)
    // Adult pilot strictly excludes minors unless explicit feature flag is active
    if (normalizedAgeBand === '15-17' && !env.MINOR_LIVE_SUPPORT_ENABLED) {
      logger.warn(`Minor support request created by user [${userId}] — held under Section 5 & 11.2.`);
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
          normalizedAgeBand,
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

    // If confirmed or matched, fetch assigned listener alias & session
    if (request.status === 'matched' || request.status === 'confirmed') {
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
        status: request.status,
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

    if (request.status === 'awaiting_seeker_confirmation') {
      const candRes = await authPool.query(
        `SELECT mc.id as candidate_id, hp.display_alias, hp.languages, hp.supported_categories, mc.match_score
         FROM match_candidates mc
         JOIN helper_profiles hp ON hp.id = mc.supporter_id
         WHERE mc.request_id = $1 AND mc.offer_status = 'listener_accepted'
         ORDER BY mc.responded_at DESC LIMIT 1`,
        [requestId]
      );
      const cand = candRes.rows[0];
      return {
        status: 'awaiting_seeker_confirmation',
        candidateId: cand?.candidate_id,
        supporter: {
          alias: cand?.display_alias || 'Verified Peer Listener',
          languages: cand?.languages || ['en'],
          categories: cand?.supported_categories || [],
        },
        message: 'A peer listener has accepted your request. Please confirm to begin your session.',
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

  /**
   * Confirms or declines a proposed match by the seeker (Mutual Acceptance).
   * Implements Section 8 & Section 9.3 of Phase 4 specification.
   *
   * @param {string} userId Seeker user ID
   * @param {string} requestId Support request ID
   * @param {{ offerId?: string, decision: 'accept' | 'decline' }} param2
   */
  static async confirmMatch(userId, requestId, { offerId, decision = 'accept' } = {}) {
    if (!['accept', 'decline'].includes(decision)) {
      throw new Error("Decision must be either 'accept' or 'decline'.");
    }

    const request = await this.getRequestById(userId, requestId);
    if (!request) {
      throw new Error('Support request not found.');
    }

    const client = await authPool.connect();
    try {
      await client.query('BEGIN');

      const reqRes = await client.query(
        `SELECT * FROM support_requests WHERE id = $1 FOR UPDATE`,
        [requestId]
      );
      const lockedReq = reqRes.rows[0];

      if (!['awaiting_seeker_confirmation', 'offered', 'matched'].includes(lockedReq.status)) {
        throw new Error(`Request is not awaiting confirmation (status: ${lockedReq.status}).`);
      }

      // Find relevant candidate offer
      let offerQuery = `
        SELECT mc.*, hp.user_id as supporter_user_id, hp.max_active_sessions, hp.display_alias
        FROM match_candidates mc
        JOIN helper_profiles hp ON hp.id = mc.supporter_id
        WHERE mc.request_id = $1
      `;
      const offerParams = [requestId];
      if (offerId) {
        offerParams.push(offerId);
        offerQuery += ` AND mc.id = $2`;
      } else {
        offerQuery += ` AND mc.offer_status IN ('listener_accepted', 'offered', 'accepted') ORDER BY mc.match_score DESC LIMIT 1`;
      }
      offerQuery += ` FOR UPDATE`;

      const candRes = await client.query(offerQuery, offerParams);
      if (candRes.rows.length === 0) {
        throw new Error('No valid pending offer found for this request.');
      }
      const candidate = candRes.rows[0];

      if (decision === 'accept') {
        // 1. Verify supporter capacity
        const countRes = await client.query(
          `SELECT COUNT(*)::int as active_count
           FROM support_sessions
           WHERE assigned_peer_id = $1
             AND session_status IN ('scheduled', 'ready', 'active', 'in_progress')`,
          [candidate.supporter_user_id]
        );
        if (countRes.rows[0].active_count >= candidate.max_active_sessions) {
          throw new Error('Listener capacity reached. Rematching with next available listener.');
        }

        // 2. Create support_assignments
        const assignRes = await client.query(
          `INSERT INTO support_assignments (request_id, supporter_id, seeker_user_id, assignment_status)
           VALUES ($1, $2, $3, 'accepted')
           ON CONFLICT (request_id) DO UPDATE SET assignment_status = 'accepted'
           RETURNING *`,
          [requestId, candidate.supporter_id, userId]
        );
        const assignment = assignRes.rows[0];

        // 3. Update match_candidates
        await client.query(
          `UPDATE match_candidates
           SET offer_status = 'seeker_confirmed', seeker_responded_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [candidate.id]
        );

        // Expire any other offers
        await client.query(
          `UPDATE match_candidates
           SET offer_status = 'expired'
           WHERE request_id = $1 AND id != $2 AND offer_status IN ('pending', 'offered', 'listener_accepted')`,
          [requestId, candidate.id]
        );

        // 4. Update request status to 'confirmed' / 'matched'
        await client.query(
          `UPDATE support_requests
           SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [requestId]
        );

        // 5. Create or fetch support_sessions
        const sessionMode = lockedReq.communication_mode === 'voice' ? 'audio' : 'text';
        const sessionRes = await client.query(
          `INSERT INTO support_sessions (
             support_request_id, assignment_id, user_id, assigned_peer_id, session_type, session_status, scheduled_for
           )
           VALUES ($1, $2, $3, $4, $5, 'scheduled', CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING
           RETURNING *`,
          [requestId, assignment.id, userId, candidate.supporter_user_id, sessionMode]
        );

        let session = sessionRes.rows[0];
        if (!session) {
          const sRes = await client.query(
            `SELECT * FROM support_sessions WHERE support_request_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [requestId]
          );
          session = sRes.rows[0];
        }

        await client.query('COMMIT');
        return {
          success: true,
          status: 'confirmed',
          assignmentId: assignment.id,
          sessionId: session?.id,
          sessionType: session?.session_type,
          sessionStatus: session?.session_status,
          supporterAlias: candidate.display_alias || 'Peer Listener',
          message: 'Match successfully confirmed by both participants. Session is scheduled.',
        };
      } else {
        // Seeker declined proposed match
        await client.query(
          `UPDATE match_candidates
           SET offer_status = 'seeker_declined', seeker_responded_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [candidate.id]
        );

        await client.query(
          `UPDATE support_requests
           SET status = 'matching', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [requestId]
        );

        await client.query('COMMIT');

        // Trigger rematching asynchronously
        MatchingService.findAndOfferMatch(requestId).catch((err) => {
          logger.error('Error triggering rematch after seeker decline', { error: err.message });
        });

        return {
          success: true,
          status: 'rematching',
          message: 'Proposed match declined. Searching for another peer listener.',
        };
      }
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
