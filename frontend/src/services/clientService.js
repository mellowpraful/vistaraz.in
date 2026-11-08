/**
 * clientService.js — Client Panel & Seeker Care API Integration
 *
 * Provides typed frontend methods communicating with the Express backend
 * using HTTP-only cookies (credentials: 'include').
 */

import { API_BASE_URL } from './authClient.js';

/**
 * Fetches real dashboard statistics for the authenticated seeker.
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function getDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/api/users/me/dashboard-stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch dashboard statistics.');
  }
  return json;
}

/**
 * Fetches real session records for the authenticated seeker.
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getSessions() {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sessions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch sessions.');
  }
  return json;
}

/**
 * Persists a daily mood check-in (Low, Tense, Okay, Good, Bright).
 * @param {string} mood
 * @param {string} [note]
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function recordMood(mood, note = '') {
  const res = await fetch(`${API_BASE_URL}/api/users/me/moods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ mood, note }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to record mood check-in.');
  }
  return json;
}

/**
 * Fetches seeker's most recent mood check-in.
 * @returns {Promise<{success: boolean, data: Object|null}>}
 */
export async function getLatestMood() {
  const res = await fetch(`${API_BASE_URL}/api/users/me/moods/latest`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch latest mood.');
  }
  return json;
}

/**
 * Persists a completed 10-area non-diagnostic wellbeing check-in.
 * @param {Object} payload
 * @param {Object} payload.answers Map of question ID to numeric score (1-5)
 * @param {Object} [payload.resultTier] Calculated summary tier { title, color, summary }
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function saveAssessment(payload) {
  const res = await fetch(`${API_BASE_URL}/api/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to record assessment reflection.');
  }
  return json;
}

/**
 * Fetches the seeker's most recent wellbeing assessment.
 * @returns {Promise<{success: boolean, data: Object|null}>}
 */
export async function getLatestAssessment() {
  const res = await fetch(`${API_BASE_URL}/api/assessments/latest`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch latest assessment.');
  }
  return json;
}

