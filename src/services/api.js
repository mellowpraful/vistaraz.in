/**
 * Vistaraz Client API Service
 * Connects React UI to the Neon PostgreSQL backed API.
 */

const TOKEN_KEY = 'vistaraz_auth_token';
const USER_KEY = 'vistaraz_auth_user';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

export function setStoredAuth(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { rawText: text };
    }
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  async register(payload) {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token && res.user) {
      setStoredAuth(res.token, res.user);
    }
    return res;
  },

  async login(payload) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token && res.user) {
      setStoredAuth(res.token, res.user);
    }
    return res;
  },

  async me() {
    return request('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      clearStoredAuth();
    }
  },

  // Assessments
  async getAssessments() {
    return request('/api/assessments');
  },

  async saveAssessment(payload) {
    return request('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Community
  async getPosts() {
    return request('/api/community');
  },

  async createPost(payload) {
    return request('/api/community', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async upvotePost(postId) {
    return request('/api/community', {
      method: 'POST',
      body: JSON.stringify({ action: 'upvote', postId })
    });
  },

  // Appointments
  async getAppointments() {
    return request('/api/appointments');
  },

  async bookAppointment(payload) {
    return request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Contact
  async submitContact(payload) {
    return request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Mood Logs
  async getMoods() {
    return request('/api/mood');
  },

  async logMood(payload) {
    return request('/api/mood', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Health
  async checkHealth() {
    return request('/api/health');
  }
};

export default api;

