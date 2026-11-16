/**
 * adminController.js — Administrative Portal Operations Controller
 *
 * Implements server-side administrative endpoints:
 * - Overview statistics (live aggregation from NeonDB)
 * - Seeker management (search, basic details without exposing private assessments)
 * - Listener applications (review, approve/reject with role transition and audit trail)
 * - Intern applications (review, academic info, approve/reject with intern role assignment)
 * - Professional accounts (read-only verification oversight)
 * - Support sessions monitoring (metadata only, private transcripts withheld)
 * - Audit logs & reporting
 */

import { authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/admin/stats
 * Aggregates live system statistics across users, listeners, interns, and sessions.
 */
export async function getAdminStats(req, res) {
  try {
    const [
      usersCountRes,
      seekersCountRes,
      listenersCountRes,
      pendingListenersRes,
      pendingInternsRes,
      approvedListenersRes,
      activeSessionsRes,
      totalSessionsRes,
    ] = await Promise.all([
      authPool.query('SELECT COUNT(*)::int as count FROM "user"'),
      authPool.query("SELECT COUNT(DISTINCT user_id)::int as count FROM user_roles WHERE role = 'user'"),
      authPool.query("SELECT COUNT(DISTINCT user_id)::int as count FROM user_roles WHERE role = 'helper'"),
      authPool.query(
        "SELECT COUNT(*)::int as count FROM helper_profiles WHERE application_status IN ('submitted', 'under_review') OR verification_status = 'pending'"
      ),
      authPool.query(
        "SELECT COUNT(*)::int as count FROM intern_applications WHERE application_status IN ('pending', 'under_review')"
      ),
      authPool.query(
        "SELECT COUNT(*)::int as count FROM helper_profiles WHERE verification_status = 'verified' OR application_status = 'approved'"
      ),
      authPool.query(
        "SELECT COUNT(*)::int as count FROM support_sessions WHERE session_status IN ('active', 'in_progress', 'scheduled')"
      ),
      authPool.query('SELECT COUNT(*)::int as count FROM support_sessions'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: usersCountRes.rows[0].count,
        totalSeekers: seekersCountRes.rows[0].count,
        totalListeners: listenersCountRes.rows[0].count,
        pendingListenerApplications: pendingListenersRes.rows[0].count,
        pendingInternApplications: pendingInternsRes.rows[0].count,
        approvedListeners: approvedListenersRes.rows[0].count,
        activeSupportSessions: activeSessionsRes.rows[0].count,
        totalSupportSessions: totalSessionsRes.rows[0].count,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch admin stats', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve administrative statistics.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/admin/seekers
 * Retrieves registered support seekers with optional search filter.
 */
export async function getSeekers(req, res) {
  try {
    const search = (req.query.search || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT u.id, u.email, u.name, u.created_at,
             p.real_name, p.avatar_id, p.is_seeker_profile_completed, p.preferred_language
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'user'
      LEFT JOIN profiles p ON u.id = p.user_id
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      queryText += ` WHERE (u.name ILIKE $1 OR u.email ILIKE $1 OR p.real_name ILIKE $1) `;
    }

    queryText += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await authPool.query(queryText, params);

    // Count total for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id)::int as total
      FROM "user" u
      JOIN user_roles ur ON u.id = ur.user_id AND ur.role = 'user'
      LEFT JOIN profiles p ON u.id = p.user_id
    `;
    const countParams = search ? [`%${search}%`] : [];
    if (search) {
      countQuery += ` WHERE (u.name ILIKE $1 OR u.email ILIKE $1 OR p.real_name ILIKE $1) `;
    }
    const countRes = await authPool.query(countQuery, countParams);

    return res.status(200).json({
      success: true,
      data: result.rows.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        realName: r.real_name || null,
        avatarId: r.avatar_id || null,
        isProfileCompleted: Boolean(r.is_seeker_profile_completed),
        preferredLanguage: r.preferred_language || 'en',
        createdAt: r.created_at,
      })),
      pagination: {
        total: countRes.rows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countRes.rows[0].total / limit),
      },
    });
  } catch (err) {
    logger.error('Failed to get seekers list', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve seekers list.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/admin/listeners/applications
 * Retrieves peer listener / helper applications with status filtering.
 */
export async function getListenerApplications(req, res) {
  try {
    const status = req.query.status || 'all';
    let queryText = `
      SELECT hp.id, hp.user_id, hp.introduction, hp.qualification, hp.languages,
             hp.verification_status, hp.application_status, hp.review_notes,
             hp.verified_at, hp.created_at, hp.updated_at,
             u.name as applicant_name, u.email as applicant_email
      FROM helper_profiles hp
      JOIN "user" u ON hp.user_id = u.id
    `;
    const params = [];

    if (status === 'pending') {
      queryText += " WHERE hp.application_status IN ('submitted', 'under_review') OR hp.verification_status = 'pending' ";
    } else if (status === 'approved' || status === 'accepted') {
      queryText += " WHERE hp.application_status = 'approved' OR hp.verification_status = 'verified' ";
    } else if (status === 'rejected') {
      queryText += " WHERE hp.application_status = 'rejected' OR hp.verification_status = 'rejected' ";
    }

    queryText += ' ORDER BY hp.created_at DESC';

    const result = await authPool.query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        applicantName: r.applicant_name,
        applicantEmail: r.applicant_email,
        qualification: r.qualification,
        introduction: r.introduction,
        languages: r.languages || ['en'],
        verificationStatus: r.verification_status,
        applicationStatus: r.application_status,
        reviewNotes: r.review_notes || null,
        verifiedAt: r.verified_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    logger.error('Failed to fetch listener applications', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve listener applications.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/admin/listeners/applications/:id
 * Retrieves specific helper application details.
 */
export async function getListenerApplicationDetails(req, res) {
  try {
    const { id } = req.params;
    const result = await authPool.query(
      `SELECT hp.*, u.name as applicant_name, u.email as applicant_email,
              admin_u.name as reviewer_name
       FROM helper_profiles hp
       JOIN "user" u ON hp.user_id = u.id
       LEFT JOIN "user" admin_u ON hp.verified_by = admin_u.id
       WHERE hp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listener application not found.',
        code: 'NOT_FOUND',
      });
    }

    const r = result.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        applicantName: r.applicant_name,
        applicantEmail: r.applicant_email,
        qualification: r.qualification,
        introduction: r.introduction,
        languages: r.languages || ['en'],
        availability: r.availability,
        verificationStatus: r.verification_status,
        applicationStatus: r.application_status,
        reviewNotes: r.review_notes,
        reviewerName: r.reviewer_name,
        verifiedAt: r.verified_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch application details', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve application details.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/admin/listeners/applications/:id/review
 * Approves or rejects a helper application within an atomic transaction.
 */
export async function reviewListenerApplication(req, res) {
  const client = await authPool.connect();
  try {
    const { id } = req.params;
    const { action, reviewNotes } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be either 'approve' or 'reject'.",
        code: 'INVALID_ACTION',
      });
    }

    const isApproval = action === 'approve' || action === 'accept';
    const notes = typeof reviewNotes === 'string' ? reviewNotes.trim() : '';

    await client.query('BEGIN');

    // 1. Fetch current application
    const appRes = await client.query(
      'SELECT id, user_id, application_status, verification_status FROM helper_profiles WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (appRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Listener application not found.',
        code: 'NOT_FOUND',
      });
    }

    const appRecord = appRes.rows[0];
    const targetUserId = appRecord.user_id;

    // 2. Update helper_profiles
    const newAppStatus = isApproval ? 'approved' : 'rejected';
    const newVerifStatus = isApproval ? 'verified' : 'rejected';

    const updateRes = await client.query(
      `UPDATE helper_profiles
       SET application_status = $1,
           verification_status = $2,
           verified_by = $3,
           verified_at = CURRENT_TIMESTAMP,
           review_notes = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [newAppStatus, newVerifStatus, adminId, notes, id]
    );

    // 3. Update user_roles
    if (isApproval) {
      await client.query(
        `INSERT INTO user_roles (user_id, role, assigned_by, assigned_at)
         VALUES ($1, 'helper', $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, role) DO NOTHING`,
        [targetUserId, adminId]
      );
    } else {
      await client.query(
        "DELETE FROM user_roles WHERE user_id = $1 AND role = 'helper'",
        [targetUserId]
      );
    }

    // 4. Record action in audit_logs
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, 'helper_profile', $3, $4::jsonb)`,
      [
        adminId,
        isApproval ? 'LISTENER_APPLICATION_APPROVED' : 'LISTENER_APPLICATION_REJECTED',
        id,
        JSON.stringify({
          applicantUserId: targetUserId,
          decision: newAppStatus,
          reviewNotes: notes,
          timestamp: new Date().toISOString(),
        }),
      ]
    );

    await client.query('COMMIT');

    logger.info(`Listener application [id: ${id}] reviewed: ${newAppStatus} by admin [id: ${adminId}]`);

    return res.status(200).json({
      success: true,
      message: `Listener application successfully ${newAppStatus}.`,
      data: {
        id,
        userId: targetUserId,
        applicationStatus: newAppStatus,
        verificationStatus: newVerifStatus,
        reviewNotes: notes,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Error reviewing listener application', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to process application review.',
      code: 'SERVER_ERROR',
    });
  } finally {
    client.release();
  }
}

/**
 * GET /api/admin/interns/applications
 * Lists intern applications with filtering.
 */
export async function getInternApplications(req, res) {
  try {
    const status = req.query.status || 'all';
    let queryText = `
      SELECT ia.*, u.name as applicant_name, u.email as applicant_email
      FROM intern_applications ia
      JOIN "user" u ON ia.user_id = u.id
    `;
    const params = [];

    if (status === 'pending') {
      queryText += " WHERE ia.application_status IN ('pending', 'under_review') ";
    } else if (status === 'approved' || status === 'accepted') {
      queryText += " WHERE ia.application_status = 'approved' ";
    } else if (status === 'rejected') {
      queryText += " WHERE ia.application_status = 'rejected' ";
    }

    queryText += ' ORDER BY ia.created_at DESC';

    const result = await authPool.query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        applicantName: r.applicant_name,
        applicantEmail: r.applicant_email,
        institution: r.institution,
        degree: r.degree,
        yearOfStudy: r.year_of_study,
        motivation: r.motivation,
        areasOfInterest: r.areas_of_interest || [],
        applicationStatus: r.application_status,
        reviewNotes: r.review_notes || null,
        reviewedAt: r.reviewed_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    logger.error('Failed to fetch intern applications', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve intern applications.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/admin/interns/applications/:id
 * Retrieves specific intern application.
 */
export async function getInternApplicationDetails(req, res) {
  try {
    const { id } = req.params;
    const result = await authPool.query(
      `SELECT ia.*, u.name as applicant_name, u.email as applicant_email,
              admin_u.name as reviewer_name
       FROM intern_applications ia
       JOIN "user" u ON ia.user_id = u.id
       LEFT JOIN "user" admin_u ON ia.reviewed_by = admin_u.id
       WHERE ia.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Intern application not found.',
        code: 'NOT_FOUND',
      });
    }

    const r = result.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: r.id,
        userId: r.user_id,
        applicantName: r.applicant_name,
        applicantEmail: r.applicant_email,
        institution: r.institution,
        degree: r.degree,
        yearOfStudy: r.year_of_study,
        motivation: r.motivation,
        areasOfInterest: r.areas_of_interest || [],
        applicationStatus: r.application_status,
        reviewNotes: r.review_notes,
        reviewerName: r.reviewer_name,
        reviewedAt: r.reviewed_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch intern application details', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve intern application details.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/admin/interns/applications/:id/review
 * Approves or rejects an academic intern application.
 */
export async function reviewInternApplication(req, res) {
  const client = await authPool.connect();
  try {
    const { id } = req.params;
    const { action, reviewNotes } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be either 'approve' or 'reject'.",
        code: 'INVALID_ACTION',
      });
    }

    const isApproval = action === 'approve' || action === 'accept';
    const notes = typeof reviewNotes === 'string' ? reviewNotes.trim() : '';

    await client.query('BEGIN');

    const appRes = await client.query(
      'SELECT id, user_id, application_status FROM intern_applications WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (appRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Intern application not found.',
        code: 'NOT_FOUND',
      });
    }

    const appRecord = appRes.rows[0];
    const targetUserId = appRecord.user_id;
    const newStatus = isApproval ? 'approved' : 'rejected';

    // 1. Update intern_applications
    await client.query(
      `UPDATE intern_applications
       SET application_status = $1,
           reviewed_by = $2,
           reviewed_at = CURRENT_TIMESTAMP,
           review_notes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newStatus, adminId, notes, id]
    );

    // 2. Assign or revoke 'intern' role
    if (isApproval) {
      await client.query(
        `INSERT INTO user_roles (user_id, role, assigned_by, assigned_at)
         VALUES ($1, 'intern', $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, role) DO NOTHING`,
        [targetUserId, adminId]
      );
    } else {
      await client.query(
        "DELETE FROM user_roles WHERE user_id = $1 AND role = 'intern'",
        [targetUserId]
      );
    }

    // 3. Log audit action
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata)
       VALUES ($1, $2, 'intern_application', $3, $4::jsonb)`,
      [
        adminId,
        isApproval ? 'INTERN_APPLICATION_APPROVED' : 'INTERN_APPLICATION_REJECTED',
        id,
        JSON.stringify({
          applicantUserId: targetUserId,
          decision: newStatus,
          reviewNotes: notes,
          timestamp: new Date().toISOString(),
        }),
      ]
    );

    await client.query('COMMIT');

    logger.info(`Intern application [id: ${id}] reviewed: ${newStatus} by admin [id: ${adminId}]`);

    return res.status(200).json({
      success: true,
      message: `Intern application successfully ${newStatus}.`,
      data: {
        id,
        userId: targetUserId,
        applicationStatus: newStatus,
        reviewNotes: notes,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    logger.error('Error reviewing intern application', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to process intern review.',
      code: 'SERVER_ERROR',
    });
  } finally {
    client.release();
  }
}

/**
 * GET /api/admin/professionals
 * Lists professional mental-health accounts.
 */
export async function getProfessionals(req, res) {
  try {
    const result = await authPool.query(`
      SELECT pp.id, pp.user_id, pp.title, pp.qualifications, pp.license_number,
             pp.licensing_body, pp.specialties, pp.languages, pp.verification_status,
             pp.approval_status, pp.approved_at, pp.created_at,
             u.name as practitioner_name, u.email as practitioner_email
      FROM professional_profiles pp
      JOIN "user" u ON pp.user_id = u.id
      ORDER BY pp.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        name: r.practitioner_name,
        email: r.practitioner_email,
        title: r.title,
        qualifications: r.qualifications,
        licenseNumber: r.license_number,
        licensingBody: r.licensing_body,
        specialties: r.specialties || [],
        languages: r.languages || ['en'],
        verificationStatus: r.verification_status,
        approvalStatus: r.approval_status,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    logger.error('Failed to fetch professionals list', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve professional accounts.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/admin/sessions
 * Monitors support session activity without exposing private message transcripts.
 */
export async function getSupportSessions(req, res) {
  try {
    const result = await authPool.query(`
      SELECT ss.id, ss.session_type, ss.session_status, ss.scheduled_for,
             ss.started_at, ss.ended_at, ss.created_at,
             seeker.name as seeker_name, seeker.email as seeker_email,
             helper.name as helper_name, helper.email as helper_email
      FROM support_sessions ss
      JOIN "user" seeker ON ss.user_id = seeker.id
      LEFT JOIN "user" helper ON ss.assigned_peer_id = helper.id
      ORDER BY ss.created_at DESC
      LIMIT 100
    `);

    return res.status(200).json({
      success: true,
      data: result.rows.map((r) => ({
        id: r.id,
        sessionType: r.session_type,
        sessionStatus: r.session_status,
        seekerName: r.seeker_name,
        seekerEmail: r.seeker_email,
        helperName: r.helper_name || 'Unassigned',
        helperEmail: r.helper_email || null,
        scheduledFor: r.scheduled_for,
        startedAt: r.started_at,
        endedAt: r.ended_at,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    logger.error('Failed to fetch support sessions', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve support sessions.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/admin/reports
 * Fetches platform audit logs for reporting.
 */
export async function getAuditReports(req, res) {
  try {
    const result = await authPool.query(`
      SELECT al.id, al.actor_id, al.action, al.resource_type, al.resource_id,
             al.metadata, al.created_at,
             u.name as actor_name, u.email as actor_email
      FROM audit_logs al
      LEFT JOIN "user" u ON al.actor_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    return res.status(200).json({
      success: true,
      data: result.rows.map((r) => ({
        id: r.id,
        actorId: r.actor_id,
        actorName: r.actor_name || 'System',
        actorEmail: r.actor_email || null,
        action: r.action,
        resourceType: r.resource_type,
        resourceId: r.resource_id,
        metadata: r.metadata,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    logger.error('Failed to fetch audit reports', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit reports.',
      code: 'SERVER_ERROR',
    });
  }
}

// ─── Phase 4 Peer Support & Safeguarding Administrative Endpoints ─────────────

/**
 * GET /api/admin/supporters
 * Lists all peer listeners with operational filters (status, availability).
 */
export async function getAdminSupporters(req, res) {
  try {
    const { status, availability, search } = req.query;
    let query = `
      SELECT hp.id, hp.user_id, hp.display_alias, hp.verification_status,
             hp.application_status, hp.availability_status, hp.max_active_sessions,
             hp.training_status, hp.safeguarding_approved, hp.languages,
             hp.supported_categories, hp.supported_modes, hp.supported_age_bands,
             hp.created_at, hp.updated_at,
             u.name as real_name, u.email as user_email,
             (
               SELECT COUNT(*)::int
               FROM support_sessions ss
               WHERE ss.assigned_peer_id = hp.user_id
                 AND ss.session_status IN ('scheduled', 'active', 'in_progress')
             ) as active_sessions_count
      FROM helper_profiles hp
      JOIN "user" u ON u.id = hp.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND hp.verification_status = $${params.length}`;
    }

    if (availability) {
      params.push(availability);
      query += ` AND hp.availability_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (hp.display_alias ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    query += ' ORDER BY hp.created_at DESC';

    const result = await authPool.query(query, params);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    logger.error('Failed to fetch admin supporters', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/admin/supporters/:id
 * Retrieves detailed supporter record with training logs.
 */
export async function getAdminSupporterById(req, res) {
  try {
    const { id } = req.params;
    const supporterRes = await authPool.query(
      `SELECT hp.*, u.name as real_name, u.email as user_email
       FROM helper_profiles hp
       JOIN "user" u ON u.id = hp.user_id
       WHERE hp.id = $1`,
      [id]
    );

    if (supporterRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Supporter not found.' });
    }

    const trainingRes = await authPool.query(
      `SELECT * FROM supporter_training WHERE supporter_id = $1 ORDER BY completed_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...supporterRes.rows[0],
        trainingModules: trainingRes.rows,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch admin supporter details', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/admin/supporters/:id/verify
 * Administrative verification approval or rejection.
 */
export async function verifyAdminSupporter(req, res) {
  try {
    const { id } = req.params;
    const { action, safeguardingApproved, reviewNotes } = req.body;
    const adminId = req.user.id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: "Action must be 'approve' or 'reject'." });
    }

    const isApproval = action === 'approve';
    const newVerifStatus = isApproval ? 'approved' : 'rejected';
    const newAppStatus = isApproval ? 'approved' : 'rejected';

    const client = await authPool.connect();
    try {
      await client.query('BEGIN');

      const supporterRes = await client.query(
        'SELECT id, user_id FROM helper_profiles WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (supporterRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'Supporter not found.' });
      }

      const supporter = supporterRes.rows[0];

      const updateRes = await client.query(
        `UPDATE helper_profiles
         SET verification_status = $1,
             application_status = $2,
             training_status = CASE WHEN $3 = true THEN 'completed' ELSE training_status END,
             safeguarding_approved = COALESCE($4, safeguarding_approved),
             verified_by = $5,
             verified_at = CURRENT_TIMESTAMP,
             review_notes = COALESCE($6, review_notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [
          newVerifStatus,
          newAppStatus,
          isApproval,
          safeguardingApproved !== undefined ? Boolean(safeguardingApproved) : null,
          adminId,
          reviewNotes || null,
          id,
        ]
      );

      if (isApproval) {
        await client.query(
          `INSERT INTO user_roles (user_id, role, assigned_by)
           VALUES ($1, 'helper', $2)
           ON CONFLICT (user_id, role) DO NOTHING`,
          [supporter.user_id, adminId]
        );
      }

      await client.query('COMMIT');
      return res.status(200).json({
        success: true,
        message: `Supporter verification ${action}d successfully.`,
        data: updateRes.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('Failed to verify supporter', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/admin/supporters/:id/suspend
 * Suspends an active supporter.
 */
export async function suspendAdminSupporter(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const resUpdate = await authPool.query(
      `UPDATE helper_profiles
       SET verification_status = 'suspended',
           availability_status = 'offline',
           review_notes = COALESCE($1, review_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [reason || 'Suspended by admin', id]
    );

    if (resUpdate.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Supporter not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Supporter suspended successfully.',
      data: resUpdate.rows[0],
    });
  } catch (err) {
    logger.error('Failed to suspend supporter', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/admin/support-requests
 * Operational request monitoring.
 */
export async function getAdminSupportRequests(req, res) {
  try {
    const { status, urgency, ageBand } = req.query;
    let query = `
      SELECT sr.*, u.name as seeker_name, u.email as seeker_email,
             (SELECT COUNT(*)::int FROM match_candidates mc WHERE mc.request_id = sr.id) as candidates_count
      FROM support_requests sr
      JOIN "user" u ON u.id = sr.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND sr.status = $${params.length}`;
    }

    if (urgency) {
      params.push(urgency);
      query += ` AND sr.urgency = $${params.length}`;
    }

    if (ageBand) {
      params.push(ageBand);
      query += ` AND sr.age_band = $${params.length}`;
    }

    query += ' ORDER BY sr.created_at DESC LIMIT 100';

    const result = await authPool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Failed to fetch admin support requests', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/admin/assignments
 * Assignment monitoring.
 */
export async function getAdminAssignments(req, res) {
  try {
    const result = await authPool.query(
      `SELECT sa.*, 
              hp.display_alias as supporter_alias,
              u.name as seeker_name,
              ss.id as session_id, ss.session_status, ss.session_type
       FROM support_assignments sa
       JOIN helper_profiles hp ON hp.id = sa.supporter_id
       JOIN "user" u ON u.id = sa.seeker_user_id
       LEFT JOIN support_sessions ss ON ss.assignment_id = sa.id
       ORDER BY sa.created_at DESC
       LIMIT 100`
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Failed to fetch admin assignments', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/admin/safeguarding-cases
 * Restricted safeguarding review for authorized personnel.
 */
export async function getAdminSafeguardingCases(req, res) {
  try {
    const { status, riskLevel } = req.query;
    let query = `
      SELECT sc.*, u.name as seeker_name, u.email as seeker_email,
             lead.name as assigned_lead_name
      FROM safeguarding_cases sc
      JOIN "user" u ON u.id = sc.seeker_user_id
      LEFT JOIN "user" lead ON lead.id = sc.assigned_lead_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND sc.status = $${params.length}`;
    }

    if (riskLevel) {
      params.push(riskLevel);
      query += ` AND sc.risk_level = $${params.length}`;
    }

    query += ' ORDER BY sc.created_at DESC LIMIT 100';

    const result = await authPool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Failed to fetch safeguarding cases', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PATCH /api/admin/safeguarding-cases/:id
 * Escalate, refer, or resolve safeguarding cases.
 */
export async function updateAdminSafeguardingCase(req, res) {
  try {
    const { id } = req.params;
    const { status, referralDestination, caseNotes } = req.body;
    const adminId = req.user.id;

    const result = await authPool.query(
      `UPDATE safeguarding_cases
       SET status = COALESCE($1, status),
           referral_destination = COALESCE($2, referral_destination),
           case_notes = COALESCE($3, case_notes),
           assigned_lead_id = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status || null, referralDestination || null, caseNotes || null, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Safeguarding case not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Safeguarding case updated.',
      data: result.rows[0],
    });
  } catch (err) {
    logger.error('Failed to update safeguarding case', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/admin/support-metrics
 * Aggregate operational peer support metrics.
 */
export async function getAdminSupportMetrics(req, res) {
  try {
    const [
      totalReqRes,
      matchedReqRes,
      completedSessionsRes,
      activeSessionsRes,
      availableSupportersRes,
      avgFeedbackRes,
    ] = await Promise.all([
      authPool.query('SELECT COUNT(*)::int as count FROM support_requests'),
      authPool.query("SELECT COUNT(*)::int as count FROM support_requests WHERE status IN ('matched', 'in_progress', 'resolved', 'closed')"),
      authPool.query("SELECT COUNT(*)::int as count FROM support_sessions WHERE session_status = 'completed'"),
      authPool.query("SELECT COUNT(*)::int as count FROM support_sessions WHERE session_status IN ('scheduled', 'active', 'in_progress')"),
      authPool.query("SELECT COUNT(*)::int as count FROM helper_profiles WHERE availability_status = 'available' AND verification_status IN ('verified', 'approved')"),
      authPool.query('SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as avg_rating FROM session_feedback'),
    ]);

    const totalRequests = totalReqRes.rows[0].count;
    const matchedRequests = matchedReqRes.rows[0].count;
    const matchRate = totalRequests > 0 ? Math.round((matchedRequests / totalRequests) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalRequests,
        matchedRequests,
        matchRatePercentage: matchRate,
        completedSessions: completedSessionsRes.rows[0].count,
        activeSessions: activeSessionsRes.rows[0].count,
        availableSupporters: availableSupportersRes.rows[0].count,
        averageFeedbackRating: parseFloat(avgFeedbackRes.rows[0].avg_rating),
      },
    });
  } catch (err) {
    logger.error('Failed to fetch support metrics', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
}


