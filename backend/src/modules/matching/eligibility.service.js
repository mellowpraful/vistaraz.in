/**
 * eligibility.service.js — Hard Eligibility Gate for Peer Matching
 *
 * Implements Section 6.2 of the Phase 4 specification.
 * A listener is eligible only if ALL required criteria pass. Safety is a hard filter, never a score bonus.
 */

import { authPool } from '../../config/auth.js';

export class EligibilityService {
  /**
   * Filters a list of supporter candidates against hard eligibility constraints.
   *
   * @param {Object} request The support request record
   * @param {Array<Object>} candidates Active supporter profile records
   * @returns {Array<Object>} Only candidates that pass 100% of eligibility filters
   */
  static filterEligibleSupporters(request, candidates) {
    return candidates.filter((supporter) => {
      // 1. Cannot match a user to themselves
      if (supporter.user_id === request.user_id) {
        return false;
      }

      // 2. Verification status must be approved / verified
      if (!['verified', 'approved'].includes(supporter.verification_status)) {
        return false;
      }

      // 3. Application status must be approved
      if (supporter.application_status && supporter.application_status !== 'approved') {
        return false;
      }

      // 4. Availability status must be explicitly 'available'
      if (supporter.availability_status !== 'available') {
        return false;
      }

      // 5. Training must be completed
      if (supporter.training_status !== 'completed') {
        return false;
      }

      // 6. Capacity check: active sessions < max_active_sessions
      const currentActive = parseInt(supporter.active_sessions_count || 0, 10);
      const maxSessions = parseInt(supporter.max_active_sessions || 1, 10);
      if (currentActive >= maxSessions) {
        return false;
      }

      // 7. Language compatibility
      const reqLang = (request.preferred_language || 'en').toLowerCase().trim();
      const supLangs = (supporter.languages || ['en']).map((l) => l.toLowerCase().trim());
      if (!supLangs.includes(reqLang)) {
        return false;
      }

      // 8. Support category compatibility
      const reqCat = (request.category || 'general_wellbeing').toLowerCase().trim();
      const supCats = (supporter.supported_categories || []).map((c) => c.toLowerCase().trim());
      if (supCats.length > 0 && !supCats.includes(reqCat) && !supCats.includes('general_wellbeing') && reqCat !== 'general_wellbeing') {
        return false;
      }

      // 9. Communication mode compatibility
      const reqMode = (request.communication_mode || 'text').toLowerCase().trim();
      const supModes = (supporter.supported_modes || ['text']).map((m) => m.toLowerCase().trim());
      if (reqMode !== 'both' && !supModes.includes(reqMode) && !supModes.includes('both')) {
        return false;
      }

      // 10. Age band safety & minor gating
      const reqAge = (request.age_band || '18-20').trim();
      const supAgeBands = supporter.supported_age_bands || ['18-20', '21-25'];

      if (reqAge === '15-17') {
        // Strict minor safeguarding rule
        if (!supporter.safeguarding_approved || !supAgeBands.includes('15-17')) {
          return false;
        }
      } else {
        if (!supAgeBands.includes(reqAge)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Queries all candidate supporter profiles from NeonDB with active session counts.
   */
  static async getCandidatePool() {
    const res = await authPool.query(
      `SELECT hp.id, hp.user_id, hp.display_alias, hp.verification_status,
              hp.application_status, hp.availability_status, hp.max_active_sessions,
              hp.training_status, hp.safeguarding_approved, hp.languages,
              hp.supported_categories, hp.supported_modes, hp.supported_age_bands,
              hp.availability, hp.updated_at,
              COALESCE(
                (SELECT COUNT(*)::int
                 FROM support_sessions ss
                 WHERE ss.assigned_peer_id = hp.user_id
                   AND ss.session_status IN ('scheduled', 'active', 'in_progress')
                ), 0
              ) as active_sessions_count
       FROM helper_profiles hp
       WHERE hp.verification_status IN ('verified', 'approved')
         AND hp.availability_status = 'available'
         AND hp.training_status = 'completed'`
    );

    return res.rows;
  }
}
