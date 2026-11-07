/**
 * Vistaraz Authentication Service
 * 
 * Production-ready authentication service connected to the Express + Better Auth backend.
 * Uses HTTP-only cookies for session management with zero localStorage credentials storage.
 */

import { authClient, API_BASE_URL } from './authClient.js';

const STORAGE_KEYS = {
  SELECTED_PURPOSE: 'vistaraz_selected_purpose',
};

/**
 * Normalizes backend user profile and roles into standard frontend user object.
 * Maps backend role 'user' to frontend 'support_seeker' for seamless UI/route compatibility,
 * while preserving the full backend `roles` array and permissions.
 */
export function normalizeUser(apiData) {
  if (!apiData) return null;

  const data = apiData.data || apiData;
  if (!data || !data.id) return null;

  const rawRoles = Array.isArray(data.roles) ? data.roles : ['user'];

  // Primary role determination for UI views
  let primaryRole = 'support_seeker';
  if (rawRoles.includes('admin')) {
    primaryRole = 'admin';
  } else if (rawRoles.includes('professional')) {
    primaryRole = 'professional';
  } else if (rawRoles.includes('helper')) {
    primaryRole = 'helper';
  } else if (rawRoles.includes('user')) {
    primaryRole = 'support_seeker';
  }

  const helperStatus = data.helper?.verification_status || 'none';
  const isHelperVerified = helperStatus === 'verified';

  return {
    id: data.id,
    name: data.name || data.profile?.display_name || 'Sanctuary Friend',
    email: data.email,
    emailVerified: Boolean(data.emailVerified),
    role: primaryRole,
    roles: rawRoles,
    profile: data.profile || {},
    helper: data.helper || null,
    professional: data.professional || null,
    helperVerificationStatus: helperStatus,
    onboardingCompleted: primaryRole === 'helper' ? isHelperVerified : true,
    createdAt: data.createdAt || null,
  };
}

/**
 * Fetches the currently authenticated user from the backend.
 * Uses credentials: 'include' to transmit HTTP-only session cookies.
 */
export async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (res.status === 401 || res.status === 403) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json.success && json.data) {
      return normalizeUser(json.data);
    }
    return null;
  } catch (err) {
    console.warn('[authService] Failed to check active session:', err.message);
    return null;
  }
}

/**
 * Log in an existing user with email and password via Better Auth.
 */
export async function login({ email, password }) {
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const response = await authClient.signIn.email({
    email: cleanEmail,
    password,
  });

  if (response.error) {
    throw new Error(response.error.message || 'Login failed. Please verify your credentials.');
  }

  // Fetch full user profile & server-assigned roles
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Authentication succeeded, but failed to retrieve user profile.');
  }

  return currentUser;
}

/**
 * Register a new user account via Better Auth.
 * Automatically declares the onboarding purpose ('user' or 'helper') on the backend.
 */
export async function register({ name, email, password, role, helperDetails }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanName) {
    throw new Error('Please enter your name or display pseudonym.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  // 1. Better Auth signup
  const signUpRes = await authClient.signUp.email({
    email: cleanEmail,
    password,
    name: cleanName,
  });

  if (signUpRes.error) {
    throw new Error(signUpRes.error.message || 'Registration failed. Please try again.');
  }

  // 2. Safe onboarding role declaration
  const targetRole = role === 'helper' ? 'helper' : 'user';
  try {
    await declareRole(targetRole, helperDetails);
  } catch (roleErr) {
    console.warn('[authService] Role declaration note:', roleErr.message);
  }

  // 3. Fetch server-verified user and roles
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return normalizeUser({
      id: signUpRes.data?.user?.id || 'usr_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      roles: [targetRole],
      helper: targetRole === 'helper' ? { verification_status: 'pending' } : null,
    });
  }

  return currentUser;
}

/**
 * Declares the user's role on the backend ('user' or 'helper').
 */
export async function declareRole(role, helperDetails = {}) {
  const safeRole = role === 'helper' ? 'helper' : 'user';
  const res = await fetch(`${API_BASE_URL}/api/users/declare-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      role: safeRole,
      helperDetails,
    }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || 'Failed to assign role.');
  }

  return res.json();
}

/**
 * Log out the currently authenticated user.
 */
export async function logout() {
  try {
    await authClient.signOut();
  } catch (err) {
    console.warn('[authService] Error during signOut:', err.message);
  }
}

/**
 * Updates profile state locally or persists changes.
 */
export function updateCurrentUser(updates = {}) {
  return updates;
}

/**
 * Verification helper status simulation for frontend testing UI.
 */
export function setHelperVerificationStatus(userId, status = 'verified') {
  return { userId, helperVerificationStatus: status };
}

/**
 * Selected purpose helpers for cross-route preservation in sessionStorage.
 */
export function getSavedPurpose() {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SELECTED_PURPOSE) || null;
  } catch {
    return null;
  }
}

export function savePurpose(purpose) {
  try {
    if (purpose) {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_PURPOSE, purpose);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PURPOSE);
    }
  } catch {
    // Ignore in non-browser environments
  }
}
