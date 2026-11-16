/**
 * scoring.service.js — Explainable, Deterministic Matching Scoring Algorithm
 *
 * Implements Section 6.3 of the Phase 4 specification.
 * Weights:
 * - Language compatibility: 25 pts
 * - Availability compatibility: 25 pts
 * - Support category compatibility: 20 pts
 * - Communication preference: 15 pts
 * - Relevant approved training: 10 pts
 * - Continuity preference: 5 pts
 * Total: 100 pts
 *
 * SENSITIVITY NOTICE: Does NOT rank by religion, caste, gender, or inferred diagnosis.
 */

export class ScoringService {
  /**
   * Calculates a match score between a support request and an eligible supporter.
   *
   * @param {Object} request The support request
   * @param {Object} supporter The eligible supporter profile
   * @param {Array<string>} pastSupporterUserIds List of supporter user IDs the seeker previously matched with
   * @returns {{ score: number, breakdown: Object }}
   */
  static calculateScore(request, supporter, pastSupporterUserIds = []) {
    let score = 0;
    const breakdown = {};

    // 1. Language compatibility (max 25)
    const reqLang = (request.preferred_language || 'en').toLowerCase().trim();
    const supLangs = (supporter.languages || ['en']).map((l) => l.toLowerCase().trim());
    if (supLangs[0] === reqLang) {
      breakdown.language = 25; // Primary language match
    } else if (supLangs.includes(reqLang)) {
      breakdown.language = 20; // Secondary language match
    } else {
      breakdown.language = 0;
    }
    score += breakdown.language;

    // 2. Availability compatibility (max 25)
    // Assess capacity margin and current online state
    const currentActive = parseInt(supporter.active_sessions_count || 0, 10);
    const maxSessions = parseInt(supporter.max_active_sessions || 1, 10);
    const capacityRatio = (maxSessions - currentActive) / maxSessions;

    if (supporter.availability_status === 'available') {
      breakdown.availability = Math.round(15 + 10 * capacityRatio);
    } else {
      breakdown.availability = 5;
    }
    score += breakdown.availability;

    // 3. Support category compatibility (max 20)
    const reqCat = (request.category || 'general_wellbeing').toLowerCase().trim();
    const supCats = (supporter.supported_categories || []).map((c) => c.toLowerCase().trim());

    if (supCats.includes(reqCat)) {
      breakdown.category = 20; // Exact category match
    } else if (supCats.includes('general_wellbeing') || reqCat === 'general_wellbeing') {
      breakdown.category = 15; // General wellbeing fallback
    } else {
      breakdown.category = 5;
    }
    score += breakdown.category;

    // 4. Communication mode preference (max 15)
    const reqMode = (request.communication_mode || 'text').toLowerCase().trim();
    const supModes = (supporter.supported_modes || ['text']).map((m) => m.toLowerCase().trim());

    if (supModes.includes(reqMode) || reqMode === 'both') {
      breakdown.mode = 15;
    } else {
      breakdown.mode = 8;
    }
    score += breakdown.mode;

    // 5. Relevant approved training (max 10)
    if (supporter.training_status === 'completed') {
      breakdown.training = 10;
    } else if (supporter.training_status === 'in_progress') {
      breakdown.training = 5;
    } else {
      breakdown.training = 0;
    }
    score += breakdown.training;

    // 6. Continuity preference (max 5)
    // If seeker had a successful session with this supporter before, give a 5-point continuity bonus
    if (pastSupporterUserIds.includes(supporter.user_id)) {
      breakdown.continuity = 5;
    } else {
      breakdown.continuity = 0;
    }
    score += breakdown.continuity;

    return {
      score: Math.min(100, Math.max(0, score)),
      breakdown,
    };
  }
}
