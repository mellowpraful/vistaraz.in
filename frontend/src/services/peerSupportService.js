/**
 * peerSupportService.js — Frontend API client for Phase 4 Peer Support & Matching
 */

import { API_BASE_URL } from './authClient';

async function request(url, options = {}) {
  const finalUrl = `${API_BASE_URL}${url}`;
  const res = await fetch(finalUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || data.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data.data !== undefined ? data.data : data;
}

// ─── 1. Supporter / Peer Listener APIs ─────────────────────────────────────────

export async function getMySupporterProfile() {
  return request('/api/supporters/me');
}

export async function updateMySupporterProfile(profileData) {
  return request('/api/supporters/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function getMySupporterStatus() {
  return request('/api/supporters/me/status');
}

export async function updateAvailability(availabilityData) {
  return request('/api/supporters/me/availability', {
    method: 'PUT',
    body: JSON.stringify(availabilityData),
  });
}

export async function getMyOffers() {
  return request('/api/supporters/me/requests');
}

export async function acceptOffer(id) {
  return request(`/api/supporters/me/requests/${id}/accept`, {
    method: 'POST',
  });
}

export async function declineOffer(id) {
  return request(`/api/supporters/me/requests/${id}/decline`, {
    method: 'POST',
  });
}

// ─── 2. Seeker Support Request APIs ───────────────────────────────────────────

export async function createSupportRequest(requestData) {
  return request('/api/support-requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

export async function getMySupportRequests() {
  return request('/api/support-requests/me');
}

export async function getSupportRequestById(id) {
  return request(`/api/support-requests/${id}`);
}

export async function cancelSupportRequest(id) {
  return request(`/api/support-requests/${id}/cancel`, {
    method: 'POST',
  });
}

export async function getMatchStatus(id) {
  return request(`/api/support-requests/${id}/match`);
}

export async function rematchSupportRequest(id) {
  return request(`/api/support-requests/${id}/rematch`, {
    method: 'POST',
  });
}

export async function confirmMatch(id, confirmationData) {
  return request(`/api/support-requests/${id}/confirm-match`, {
    method: 'POST',
    body: JSON.stringify(confirmationData),
  });
}

// ─── 3. Session & Messaging APIs ──────────────────────────────────────────────

export async function getMySessions() {
  return request('/api/sessions/me');
}

export async function getSessionById(id) {
  return request(`/api/sessions/${id}`);
}

export async function startSession(id) {
  return request(`/api/sessions/${id}/start`, {
    method: 'POST',
  });
}

export async function endSession(id) {
  return request(`/api/sessions/${id}/end`, {
    method: 'POST',
  });
}

export async function getSessionMessages(id, limit = 50, before = null) {
  const query = new URLSearchParams();
  if (limit) query.append('limit', limit);
  if (before) query.append('before', before);
  const qStr = query.toString();
  return request(`/api/sessions/${id}/messages${qStr ? `?${qStr}` : ''}`);
}

export async function sendSessionMessage(id, messageBody) {
  return request(`/api/sessions/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ messageBody }),
  });
}

export async function submitSessionFeedback(id, feedbackData) {
  return request(`/api/sessions/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
}

export async function reportSessionConcern(id, reportData) {
  return request(`/api/sessions/${id}/report`, {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
}

// ─── 4. Voice Communication APIs ──────────────────────────────────────────────

export async function createVoiceRoom(id) {
  return request(`/api/sessions/${id}/voice-room`, {
    method: 'POST',
  });
}

export async function scheduleVoiceSession(id, scheduledAt) {
  return request(`/api/sessions/${id}/voice/schedule`, {
    method: 'POST',
    body: JSON.stringify({ scheduledAt }),
  });
}

export async function issueVoiceToken(id) {
  return request(`/api/sessions/${id}/voice/join-token`, {
    method: 'POST',
  });
}

export async function endVoiceRoom(id) {
  return request(`/api/sessions/${id}/voice/end`, {
    method: 'POST',
  });
}
