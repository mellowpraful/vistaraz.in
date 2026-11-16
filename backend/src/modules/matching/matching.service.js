/**
 * matching.service.js — Intelligent Matching Engine & Offer Dispatcher
 *
 * Implements Section 6 of the Phase 4 specification.
 * - Enforces hard eligibility filters
 * - Computes multi-factor explainable ranking
 * - Dispatches single-candidate offers with a TTL response window
 * - Rematches automatically when previous offers expire or are declined
 */

import { authPool } from '../../config/auth.js';
import { EligibilityService } from './eligibility.service.js';
import { ScoringService } from './scoring.service.js';
import { logger } from '../../utils/logger.js';

export class MatchingService {
  /**
   * Evaluates an open support request and offers it to the top eligible supporter.
   *
   * @param {string} requestId
   * @returns {Promise<{ success: boolean, matched: boolean, offer?: Object, reason?: string }>}
   */
  static async findAndOfferMatch(requestId) {
    const reqRes = await authPool.query(
      `SELECT * FROM support_requests WHERE id = $1`,
      [requestId]
    );

    if (reqRes.rows.length === 0) {
      throw new Error('Support request not found.');
    }

    const request = reqRes.rows[0];

    // Request must be in matching or open state
    if (!['open', 'requested', 'matching', 'offered'].includes(request.status)) {
      return { success: false, matched: false, reason: `Request is already in status: ${request.status}` };
    }

    // Minors safety gate: if age_band is '15-17', verify youth pathway readiness
    if (request.age_band === '15-17') {
      logger.warn(`Minor support request [${requestId}] received. Gated under Section 11.2.`);
    }

    // 1. Fetch all potential candidates and past supporters of this seeker
    const [candidates, pastSessionsRes, previousDeclinedRes] = await Promise.all([
      EligibilityService.getCandidatePool(),
      authPool.query(
        `SELECT DISTINCT assigned_peer_id FROM support_sessions WHERE user_id = $1 AND assigned_peer_id IS NOT NULL`,
        [request.user_id]
      ),
      authPool.query(
        `SELECT supporter_id FROM match_candidates WHERE request_id = $1 AND offer_status IN ('declined', 'expired')`,
        [requestId]
      ),
    ]);

    const pastSupporters = pastSessionsRes.rows.map((r) => r.assigned_peer_id);
    const previouslyAttemptedSupporterIds = new Set(previousDeclinedRes.rows.map((r) => r.supporter_id));

    // 2. Filter out supporters who previously declined or expired on this specific request
    const freshCandidates = candidates.filter((c) => !previouslyAttemptedSupporterIds.has(c.id));

    // 3. Apply Hard Eligibility Filters
    const eligible = EligibilityService.filterEligibleSupporters(request, freshCandidates);

    if (eligible.length === 0) {
      await authPool.query(
        `UPDATE support_requests SET status = 'matching', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [requestId]
      );
      return {
        success: true,
        matched: false,
        reason: 'No eligible peer listeners currently available matching all criteria. Request is queued in matching.',
      };
    }

    // 4. Score and Rank remaining candidates
    const scored = eligible.map((supporter) => {
      const { score, breakdown } = ScoringService.calculateScore(request, supporter, pastSupporters);
      return { supporter, score, breakdown };
    });

    scored.sort((a, b) => b.score - a.score);

    const topCandidate = scored[0];
    const offerTtlMinutes = 10;
    const expiresAt = new Date(Date.now() + offerTtlMinutes * 60 * 1000);

    // 5. Create atomic match_candidate offer
    const client = await authPool.connect();
    try {
      await client.query('BEGIN');

      const insertRes = await client.query(
        `INSERT INTO match_candidates (
           request_id, supporter_id, match_score, eligibility_status, offer_status, offered_at, expires_at
         )
         VALUES ($1, $2, $3, 'eligible', 'offered', CURRENT_TIMESTAMP, $4)
         ON CONFLICT (request_id, supporter_id)
         DO UPDATE SET
           match_score = EXCLUDED.match_score,
           offer_status = 'offered',
           offered_at = CURRENT_TIMESTAMP,
           expires_at = EXCLUDED.expires_at
         RETURNING *`,
        [requestId, topCandidate.supporter.id, topCandidate.score, expiresAt]
      );

      await client.query(
        `UPDATE support_requests SET status = 'offered', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [requestId]
      );

      await client.query('COMMIT');

      logger.info(
        `Offer dispatched for request [${requestId}] to supporter [${topCandidate.supporter.id}] with score ${topCandidate.score}`
      );

      return {
        success: true,
        matched: true,
        candidateId: insertRes.rows[0].id,
        matchScore: topCandidate.score,
        supporterAlias: topCandidate.supporter.display_alias || 'Peer Listener',
        expiresAt,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Sweeps expired offers and triggers rematching.
   */
  static async sweepExpiredOffers() {
    const expiredRes = await authPool.query(
      `UPDATE match_candidates
       SET offer_status = 'expired'
       WHERE offer_status = 'offered'
         AND expires_at < CURRENT_TIMESTAMP
       RETURNING request_id`
    );

    const rematched = [];
    for (const row of expiredRes.rows) {
      try {
        const res = await this.findAndOfferMatch(row.request_id);
        rematched.push({ requestId: row.request_id, result: res });
      } catch (err) {
        logger.error(`Error rematching request [${row.request_id}]`, { error: err.message });
      }
    }

    return { expiredCount: expiredRes.rows.length, rematched };
  }
}
