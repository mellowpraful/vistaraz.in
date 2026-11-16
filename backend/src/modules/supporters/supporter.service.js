/**
 * supporter.service.js — Peer Listener Operational & Profile Service
 *
 * Handles:
 * - Profile retrieval and permitted updates (alias, bio, languages, categories)
 * - Verification and training status
 * - Availability management (toggle online/offline, working hours, capacity)
 * - Eligible offer discovery
 * - Atomic offer acceptance and decline
 */

import { authPool } from '../../config/auth.js';
import { logger } from '../../utils/logger.js';

export class SupporterService {
  /**
   * Retrieves full operational supporter profile by user ID.
   */
  static async getProfileByUserId(userId) {
    const res = await authPool.query(
      `SELECT hp.id, hp.user_id, hp.display_alias, hp.introduction, hp.qualification,
              hp.languages, hp.verification_status, hp.application_status,
              hp.availability_status, hp.max_active_sessions, hp.training_status,
              hp.safeguarding_approved, hp.supported_age_bands, hp.supported_categories,
              hp.supported_modes, hp.availability, hp.code_of_conduct_accepted_at,
              hp.created_at, hp.updated_at,
              COALESCE(u.name, 'Peer Listener') as user_name,
              (
                SELECT COUNT(*)::int 
                FROM support_sessions ss 
                WHERE ss.assigned_peer_id = hp.user_id 
                  AND ss.session_status IN ('scheduled', 'active', 'in_progress')
              ) as active_sessions_count
       FROM helper_profiles hp
       JOIN "user" u ON u.id = hp.user_id
       WHERE hp.user_id = $1`,
      [userId]
    );

    return res.rows[0] || null;
  }

  /**
   * Updates non-sensitive supporter profile fields.
   */
  static async updateProfile(userId, data) {
    const {
      displayAlias,
      introduction,
      qualification,
      languages,
      supportedCategories,
      supportedModes,
      supportedAgeBands,
    } = data;

    const fields = [];
    const values = [];
    let idx = 1;

    if (typeof displayAlias === 'string' && displayAlias.trim()) {
      fields.push(`display_alias = $${idx++}`);
      values.push(displayAlias.trim().slice(0, 80));
    }

    if (typeof introduction === 'string') {
      fields.push(`introduction = $${idx++}`);
      values.push(introduction.trim().slice(0, 2000));
    }

    if (typeof qualification === 'string') {
      fields.push(`qualification = $${idx++}`);
      values.push(qualification.trim().slice(0, 500));
    }

    if (Array.isArray(languages) && languages.length > 0) {
      fields.push(`languages = $${idx++}`);
      values.push(languages.map((l) => String(l).toLowerCase().trim()));
    }

    if (Array.isArray(supportedCategories) && supportedCategories.length > 0) {
      fields.push(`supported_categories = $${idx++}`);
      values.push(supportedCategories.map((c) => String(c).toLowerCase().trim()));
    }

    if (Array.isArray(supportedModes) && supportedModes.length > 0) {
      fields.push(`supported_modes = $${idx++}`);
      values.push(supportedModes.map((m) => String(m).toLowerCase().trim()));
    }

    if (Array.isArray(supportedAgeBands) && supportedAgeBands.length > 0) {
      // Minors (15-17) can only be added if safeguarding_approved is true
      const supporter = await this.getProfileByUserId(userId);
      const safeBands = supportedAgeBands.filter((b) => {
        if (b === '15-17') return Boolean(supporter?.safeguarding_approved);
        return ['18-20', '21-25'].includes(b);
      });
      fields.push(`supported_age_bands = $${idx++}`);
      values.push(safeBands);
    }

    if (fields.length === 0) {
      return this.getProfileByUserId(userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE helper_profiles
      SET ${fields.join(', ')}
      WHERE user_id = $${idx}
      RETURNING *;
    `;

    const res = await authPool.query(query, values);
    return res.rows[0];
  }

  /**
   * Updates availability and working hours.
   */
  static async updateAvailability(userId, { status, maxActiveSessions, activeDays, hours }) {
    const validStatuses = ['available', 'offline', 'busy', 'paused'];
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const supporter = await this.getProfileByUserId(userId);
    if (!supporter) {
      throw new Error('Supporter profile not found');
    }

    // Only approved/verified helpers can mark themselves 'available'
    if (status === 'available' && !['verified', 'approved'].includes(supporter.verification_status)) {
      throw new Error('Cannot set status to available before administrative approval.');
    }

    let parsedMaxSessions = supporter.max_active_sessions;
    if (maxActiveSessions !== undefined) {
      const parsed = parseInt(maxActiveSessions, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 5) {
        throw new Error('max_active_sessions must be an integer between 1 and 5');
      }
      parsedMaxSessions = parsed;
    }

    const currentAvail = supporter.availability || {};
    const updatedAvailJson = {
      ...currentAvail,
      is_online: status === 'available',
      active_days: Array.isArray(activeDays) ? activeDays : currentAvail.active_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hours: typeof hours === 'string' ? hours : currentAvail.hours || '10:00-18:00',
    };

    const newStatus = status || supporter.availability_status;

    const res = await authPool.query(
      `UPDATE helper_profiles
       SET availability_status = $1,
           max_active_sessions = $2,
           availability = $3,
           last_availability_updated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING *`,
      [newStatus, parsedMaxSessions, JSON.stringify(updatedAvailJson), userId]
    );

    return res.rows[0];
  }

  /**
   * Fetches active incoming offers for this supporter.
   * STRICT PRIVACY: Does NOT expose seeker's real identity, assessment, or email.
   */
  static async getEligibleOffers(userId) {
    const supporter = await this.getProfileByUserId(userId);
    if (!supporter) return [];

    const res = await authPool.query(
      `SELECT mc.id as candidate_id, mc.request_id, mc.match_score, mc.offer_status,
              mc.offered_at, mc.expires_at,
              sr.category as support_category,
              sr.preferred_language,
              sr.communication_mode,
              sr.age_band,
              sr.urgency,
              sr.preferred_time_start,
              sr.preferred_time_end,
              sr.created_at as request_created_at
       FROM match_candidates mc
       JOIN support_requests sr ON sr.id = mc.request_id
       WHERE mc.supporter_id = $1
         AND mc.offer_status = 'offered'
         AND (mc.expires_at IS NULL OR mc.expires_at > CURRENT_TIMESTAMP)
         AND sr.status IN ('matching', 'offered')
       ORDER BY mc.offered_at DESC`,
      [supporter.id]
    );

    return res.rows;
  }

  /**
   * Accepts an offer atomically: locks request, creates assignment and session.
   */
  static async acceptOffer(userId, candidateOrRequestId) {
    const supporter = await this.getProfileByUserId(userId);
    if (!supporter) {
      throw new Error('Supporter profile not found');
    }

    if (!['verified', 'approved'].includes(supporter.verification_status)) {
      throw new Error('Only approved supporters can accept requests.');
    }

    const client = await authPool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock and verify candidate
      const candRes = await client.query(
        `SELECT mc.*, sr.user_id as seeker_id, sr.communication_mode, sr.category
         FROM match_candidates mc
         JOIN support_requests sr ON sr.id = mc.request_id
         WHERE (mc.id::text = $1 OR mc.request_id::text = $1)
           AND mc.supporter_id = $2
         FOR UPDATE`,
        [candidateOrRequestId, supporter.id]
      );

      if (candRes.rows.length === 0) {
        throw new Error('Offer not found or not addressed to this supporter.');
      }

      const candidate = candRes.rows[0];
      if (candidate.offer_status === 'accepted') {
        throw new Error('Offer has already been accepted.');
      }

      if (candidate.offer_status !== 'offered' && candidate.offer_status !== 'pending') {
        throw new Error(`Offer cannot be accepted in status: ${candidate.offer_status}`);
      }

      if (candidate.expires_at && new Date(candidate.expires_at) < new Date()) {
        await client.query(
          `UPDATE match_candidates SET offer_status = 'expired' WHERE id = $1`,
          [candidate.id]
        );
        throw new Error('Offer has expired.');
      }

      // 2. Verify supporter capacity
      const activeCountRes = await client.query(
        `SELECT COUNT(*)::int as active_count
         FROM support_sessions
         WHERE assigned_peer_id = $1
           AND session_status IN ('scheduled', 'active', 'in_progress')`,
        [userId]
      );

      if (activeCountRes.rows[0].active_count >= supporter.max_active_sessions) {
        throw new Error('Capacity limit reached. Complete existing sessions before accepting new ones.');
      }

      // 3. Lock request row
      const reqRes = await client.query(
        `SELECT id, status FROM support_requests WHERE id = $1 FOR UPDATE`,
        [candidate.request_id]
      );

      if (reqRes.rows.length === 0 || !['open', 'requested', 'matching', 'offered'].includes(reqRes.rows[0].status)) {
        throw new Error('Request is no longer available for matching.');
      }

      // 4. Create support_assignments
      const assignRes = await client.query(
        `INSERT INTO support_assignments (request_id, supporter_id, seeker_user_id, assignment_status)
         VALUES ($1, $2, $3, 'accepted')
         RETURNING *`,
        [candidate.request_id, supporter.id, candidate.seeker_id]
      );
      const assignment = assignRes.rows[0];

      // 5. Update match_candidates
      await client.query(
        `UPDATE match_candidates
         SET offer_status = 'accepted', responded_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [candidate.id]
      );

      // Expire any other open offers for this request
      await client.query(
        `UPDATE match_candidates
         SET offer_status = 'expired'
         WHERE request_id = $1 AND id != $2 AND offer_status IN ('pending', 'offered')`,
        [candidate.request_id, candidate.id]
      );

      // 6. Update support_requests
      await client.query(
        `UPDATE support_requests
         SET status = 'matched', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [candidate.request_id]
      );

      // 7. Create support_sessions
      const sessionMode = candidate.communication_mode === 'voice' ? 'audio' : 'text';
      const sessionRes = await client.query(
        `INSERT INTO support_sessions (
           support_request_id, assignment_id, user_id, assigned_peer_id, session_type, session_status, scheduled_for
         )
         VALUES ($1, $2, $3, $4, $5, 'scheduled', CURRENT_TIMESTAMP)
         RETURNING *`,
        [candidate.request_id, assignment.id, candidate.seeker_id, userId, sessionMode]
      );
      const session = sessionRes.rows[0];

      await client.query('COMMIT');
      logger.info(`Supporter [${supporter.id}] accepted request [${candidate.request_id}]. Session [${session.id}] established.`);

      return {
        success: true,
        assignmentId: assignment.id,
        sessionId: session.id,
        sessionType: session.session_type,
        sessionStatus: session.session_status,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Error accepting offer', { error: err.message });
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Declines an offer. Marks offer declined and returns request to matching.
   */
  static async declineOffer(userId, candidateOrRequestId) {
    const supporter = await this.getProfileByUserId(userId);
    if (!supporter) {
      throw new Error('Supporter profile not found');
    }

    const client = await authPool.connect();
    try {
      await client.query('BEGIN');

      const candRes = await client.query(
        `SELECT id, request_id, offer_status 
         FROM match_candidates 
         WHERE (id::text = $1 OR request_id::text = $1)
           AND supporter_id = $2
         FOR UPDATE`,
        [candidateOrRequestId, supporter.id]
      );

      if (candRes.rows.length === 0) {
        throw new Error('Offer not found.');
      }

      const candidate = candRes.rows[0];
      await client.query(
        `UPDATE match_candidates 
         SET offer_status = 'declined', responded_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [candidate.id]
      );

      // Put request back into matching queue
      await client.query(
        `UPDATE support_requests 
         SET status = 'matching', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND status = 'offered'`,
        [candidate.request_id]
      );

      await client.query('COMMIT');
      return { success: true, message: 'Offer declined. Request returned to matching queue.' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
