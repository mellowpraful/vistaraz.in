/**
 * session.service.js — Support Session Lifecycle & Authorization Service
 *
 * Implements Section 7, 8.3 & 9 of the Phase 4 specification.
 * Controls session states (scheduled -> active -> completed / cancelled / escalated),
 * participant authorization, private message persistence, feedback, and concern reporting.
 */

import { authPool } from '../../config/auth.js';
import { logger } from '../../utils/logger.js';

export class SessionService {
  /**
   * Asserts that a user is an authorized participant (seeker or peer) in a session.
   * Throws 403 / Error if not authorized.
   */
  static async verifyParticipant(sessionId, userId) {
    const res = await authPool.query(
      `SELECT ss.*, 
              hp.display_alias as supporter_alias,
              hp.id as supporter_profile_id,
              u.name as seeker_name
       FROM support_sessions ss
       LEFT JOIN helper_profiles hp ON hp.user_id = ss.assigned_peer_id
       LEFT JOIN "user" u ON u.id = ss.user_id
       WHERE ss.id = $1`,
      [sessionId]
    );

    if (res.rows.length === 0) {
      const err = new Error('Session not found.');
      err.statusCode = 404;
      err.code = 'SESSION_NOT_FOUND';
      throw err;
    }

    const session = res.rows[0];
    const isSeeker = session.user_id === userId;
    const isSupporter = session.assigned_peer_id === userId;

    if (!isSeeker && !isSupporter) {
      const err = new Error('Access denied. You are not an assigned participant in this session.');
      err.statusCode = 403;
      err.code = 'UNAUTHORIZED_SESSION_ACCESS';
      throw err;
    }

    return {
      session,
      isSeeker,
      isSupporter,
      roleInSession: isSeeker ? 'seeker' : 'supporter',
    };
  }

  /**
   * Lists all sessions for a user (as seeker or as supporter).
   */
  static async getMySessions(userId) {
    const res = await authPool.query(
      `SELECT ss.id, ss.support_request_id, ss.assignment_id, ss.session_type,
              ss.session_status, ss.scheduled_for, ss.started_at, ss.ended_at,
              ss.created_at, ss.updated_at,
              CASE 
                WHEN ss.user_id = $1 THEN 'seeker' 
                ELSE 'supporter' 
              END as user_role_in_session,
              hp.display_alias as supporter_alias,
              (
                SELECT COUNT(*)::int 
                FROM session_messages sm 
                WHERE sm.session_id = ss.id
              ) as message_count
       FROM support_sessions ss
       LEFT JOIN helper_profiles hp ON hp.user_id = ss.assigned_peer_id
       WHERE ss.user_id = $1 OR ss.assigned_peer_id = $1
       ORDER BY ss.created_at DESC`,
      [userId]
    );

    return res.rows;
  }

  /**
   * Retrieves single authorized session details.
   */
  static async getSessionById(sessionId, userId) {
    const { session, roleInSession } = await this.verifyParticipant(sessionId, userId);
    return {
      ...session,
      user_role_in_session: roleInSession,
    };
  }

  /**
   * Starts a scheduled session (transitions to 'active' or 'in_progress').
   */
  static async startSession(sessionId, userId) {
    await this.verifyParticipant(sessionId, userId);

    const res = await authPool.query(
      `UPDATE support_sessions
       SET session_status = 'active',
           started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND session_status IN ('scheduled', 'active')
       RETURNING *`,
      [sessionId]
    );

    if (res.rows.length === 0) {
      throw new Error('Session cannot be started or has already ended.');
    }

    return res.rows[0];
  }

  /**
   * Ends an active session.
   */
  static async endSession(sessionId, userId) {
    await this.verifyParticipant(sessionId, userId);

    const client = await authPool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `UPDATE support_sessions
         SET session_status = 'completed',
             ended_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND session_status IN ('scheduled', 'active', 'in_progress')
         RETURNING *`,
        [sessionId]
      );

      if (res.rows.length === 0) {
        throw new Error('Session is not active or has already ended.');
      }

      const session = res.rows[0];

      // Close associated assignment
      if (session.assignment_id) {
        await client.query(
          `UPDATE support_assignments
           SET assignment_status = 'ended', ended_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [session.assignment_id]
        );
      }

      // Close associated voice room if open
      await client.query(
        `UPDATE voice_rooms
         SET room_status = 'closed', closed_at = CURRENT_TIMESTAMP
         WHERE session_id = $1 AND room_status != 'closed'`,
        [sessionId]
      );

      await client.query('COMMIT');
      logger.info(`Session [${sessionId}] ended by participant [${userId}].`);
      return session;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves messages for an authorized session.
   */
  static async getMessages(sessionId, userId, limit = 100, before = null) {
    await this.verifyParticipant(sessionId, userId);

    const values = [sessionId, Math.min(100, parseInt(limit, 10) || 50)];
    let timeFilter = '';

    if (before) {
      values.push(new Date(before));
      timeFilter = 'AND sm.created_at < $3';
    }

    const res = await authPool.query(
      `SELECT sm.id, sm.session_id, sm.sender_user_id, sm.message_body,
              sm.is_read, sm.created_at,
              CASE WHEN sm.sender_user_id = $${before ? 4 : 3} THEN true ELSE false END as is_self
       FROM session_messages sm
       WHERE sm.session_id = $1
         AND sm.deleted_at IS NULL
         ${timeFilter}
       ORDER BY sm.created_at ASC
       LIMIT $2`,
      before ? [...values, userId] : [...values, userId]
    );

    return res.rows;
  }

  /**
   * Sends a private message in an active session.
   */
  static async sendMessage(sessionId, userId, messageBody) {
    const { session } = await this.verifyParticipant(sessionId, userId);

    if (['completed', 'cancelled', 'no_show'].includes(session.session_status)) {
      throw new Error('Cannot send messages to an ended or cancelled session.');
    }

    if (!messageBody || typeof messageBody !== 'string' || !messageBody.trim()) {
      throw new Error('Message body cannot be empty.');
    }

    const trimmed = messageBody.trim();
    if (trimmed.length > 5000) {
      throw new Error('Message length exceeds the 5,000 character maximum.');
    }

    // Auto-transition scheduled session to active on first message
    if (session.session_status === 'scheduled') {
      await authPool.query(
        `UPDATE support_sessions 
         SET session_status = 'active', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [sessionId]
      );
    }

    const res = await authPool.query(
      `INSERT INTO session_messages (session_id, sender_user_id, message_body)
       VALUES ($1, $2, $3)
       RETURNING id, session_id, sender_user_id, message_body, is_read, created_at`,
      [sessionId, userId, trimmed]
    );

    return res.rows[0];
  }

  /**
   * Submits post-session feedback.
   */
  static async submitFeedback(sessionId, userId, { rating, feedbackCategory, notes }) {
    await this.verifyParticipant(sessionId, userId);

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }

    const res = await authPool.query(
      `INSERT INTO session_feedback (session_id, submitted_by, rating, feedback_category, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (session_id, submitted_by)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         feedback_category = EXCLUDED.feedback_category,
         notes = EXCLUDED.notes
       RETURNING *`,
      [
        sessionId,
        userId,
        parsedRating,
        typeof feedbackCategory === 'string' ? feedbackCategory.slice(0, 50) : null,
        typeof notes === 'string' ? notes.slice(0, 1000) : null,
      ]
    );

    return res.rows[0];
  }

  /**
   * Submits an incident report during or after a session.
   */
  static async submitReport(sessionId, reporterUserId, { reportType, description }) {
    const { session, roleInSession } = await this.verifyParticipant(sessionId, reporterUserId);

    const validTypes = ['inappropriate_behavior', 'boundary_violation', 'harassment', 'safety_concern', 'other'];
    if (!validTypes.includes(reportType)) {
      throw new Error(`Invalid report type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new Error('Report description is required.');
    }

    const reportedUserId = roleInSession === 'seeker' ? session.assigned_peer_id : session.user_id;

    const res = await authPool.query(
      `INSERT INTO support_reports (session_id, reporter_user_id, reported_user_id, report_type, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [sessionId, reporterUserId, reportedUserId, reportType, description.trim().slice(0, 4000)]
    );

    logger.warn(`Incident report filed for session [${sessionId}] by user [${reporterUserId}].`);
    return res.rows[0];
  }
}
