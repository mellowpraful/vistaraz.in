/**
 * adminService.js — Frontend Administrative API Client
 *
 * Communicates with backend /api/admin/* endpoints using HTTP-only credentials.
 */

import { API_BASE_URL } from './authClient.js';

async function fetchAdminApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/admin${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `Admin API Error (${res.status})`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.code = data.code;
    throw error;
  }

  return data;
}

/**
 * Fetch live system statistics across users, listeners, and sessions.
 */
export async function getAdminStats() {
  return fetchAdminApi('/stats');
}

/**
 * Fetch registered seekers with optional search and pagination.
 */
export async function getSeekers({ search = '', page = 1, limit = 20 } = {}) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (page) query.set('page', page);
  if (limit) query.set('limit', limit);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  return fetchAdminApi(`/seekers${qStr}`);
}

/**
 * Fetch listener / helper applications with optional status filter.
 */
export async function getListenerApplications(status = 'all') {
  const qStr = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return fetchAdminApi(`/listeners/applications${qStr}`);
}

/**
 * Fetch specific listener application details.
 */
export async function getListenerApplicationDetails(id) {
  return fetchAdminApi(`/listeners/applications/${id}`);
}

/**
 * Review (approve / reject) a listener application.
 */
export async function reviewListenerApplication(id, { action, reviewNotes }) {
  return fetchAdminApi(`/listeners/applications/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, reviewNotes }),
  });
}

/**
 * Fetch intern applications with optional status filter.
 */
export async function getInternApplications(status = 'all') {
  const qStr = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return fetchAdminApi(`/interns/applications${qStr}`);
}

/**
 * Fetch specific intern application details.
 */
export async function getInternApplicationDetails(id) {
  return fetchAdminApi(`/interns/applications/${id}`);
}

/**
 * Review (approve / reject) an intern application.
 */
export async function reviewInternApplication(id, { action, reviewNotes }) {
  return fetchAdminApi(`/interns/applications/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, reviewNotes }),
  });
}

/**
 * Fetch licensed mental-health professional accounts.
 */
export async function getProfessionals() {
  return fetchAdminApi('/professionals');
}

/**
 * Fetch support sessions for monitoring.
 */
export async function getSupportSessions() {
  return fetchAdminApi('/sessions');
}

/**
 * Fetch platform audit trail reports.
 */
export async function getAuditReports() {
  return fetchAdminApi('/reports');
}

