/**
 * Vistaraz Functional LocalStorage Authentication Service
 * 
 * Provides mock authentication, account persistence, and session management
 * for local development and QA testing without requiring a live backend.
 * 
 * Account fields:
 * - id: string
 * - name: string
 * - email: string
 * - passwordHash: string (SHA-256 via Web Crypto API)
 * - role: 'support_seeker' | 'helper'
 * - onboardingCompleted: boolean
 * - helperVerificationStatus: 'pending' | 'verified' | 'none'
 * - createdAt: string (ISO timestamp)
 * 
 * Session fields:
 * - userId: string
 * - authenticatedAt: string (ISO timestamp)
 * 
 * Security limitation: This is a client-side testing prototype using localStorage.
 * Passwords are hashed browser-side via SHA-256. It is not intended for production.
 */

const STORAGE_KEYS = {
  ACCOUNTS: 'vistaraz_accounts',
  SESSION: 'vistaraz_session',
  SELECTED_PURPOSE: 'vistaraz_selected_purpose',
};

/**
 * Computes SHA-256 hash using Web Crypto API.
 * Never stores plain-text passwords in localStorage.
 */
export async function hashPassword(password) {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_vistaraz_salt_2026');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Reads accounts array from localStorage safely.
 */
export function getAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[authService] Failed to parse accounts:', err);
    return [];
  }
}

/**
 * Saves accounts array to localStorage.
 */
function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

/**
 * Reads active mock session from localStorage.
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.userId) {
      return session;
    }
    return null;
  } catch (err) {
    console.error('[authService] Failed to parse session:', err);
    return null;
  }
}

/**
 * Saves active session to localStorage.
 */
function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

/**
 * Clears active session from localStorage.
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * Strips sensitive fields (like passwordHash) before exposing user object to components.
 */
function sanitizeUser(account) {
  if (!account) return null;
  const { passwordHash, ...safeUser } = account;
  return safeUser;
}

/**
 * Retrieves the currently authenticated user based on the active session.
 */
export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const accounts = getAccounts();
  const account = accounts.find((acc) => acc.id === session.userId);
  if (!account) {
    clearSession();
    return null;
  }

  return sanitizeUser(account);
}

/**
 * Register a new user account.
 * 
 * Validates fields, checks for duplicate email, hashes password, saves account,
 * and establishes a session.
 */
export async function register({ name, email, password, role }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanRole = role === 'helper' ? 'helper' : 'support_seeker';

  if (!cleanName) {
    throw new Error('Please enter your name or preferred display name.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const accounts = getAccounts();
  const existing = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const passwordHash = await hashPassword(password);

  const newAccount = {
    id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: cleanRole,
    onboardingCompleted: false,
    helperVerificationStatus: cleanRole === 'helper' ? 'pending' : 'none',
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // Automatically authenticate user after registration
  const session = {
    userId: newAccount.id,
    authenticatedAt: new Date().toISOString(),
  };
  saveSession(session);

  return sanitizeUser(newAccount);
}

/**
 * Log in an existing user with email and password.
 */
export async function login({ email, password }) {
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const accounts = getAccounts();
  const account = accounts.find((acc) => acc.email.toLowerCase() === cleanEmail);

  if (!account) {
    throw new Error('No account found with this email. Please check your spelling or register.');
  }

  const incomingHash = await hashPassword(password);
  if (account.passwordHash !== incomingHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  const session = {
    userId: account.id,
    authenticatedAt: new Date().toISOString(),
  };
  saveSession(session);

  return sanitizeUser(account);
}

/**
 * Log out the currently authenticated user.
 */
export function logout() {
  clearSession();
}

/**
 * Updates properties on the currently authenticated user account.
 */
export function updateCurrentUser(updates = {}) {
  const session = getSession();
  if (!session) return null;

  const accounts = getAccounts();
  const index = accounts.findIndex((acc) => acc.id === session.userId);
  if (index === -1) return null;

  // Disallow updating immutable fields
  const { id, passwordHash, createdAt, ...allowedUpdates } = updates;

  accounts[index] = {
    ...accounts[index],
    ...allowedUpdates,
  };

  saveAccounts(accounts);
  return sanitizeUser(accounts[index]);
}

/**
 * Development utility: toggle or set helper verification status for testing.
 */
export function setHelperVerificationStatus(userId, status = 'verified') {
  const accounts = getAccounts();
  const index = accounts.findIndex((acc) => acc.id === userId);
  if (index === -1) return null;

  accounts[index].helperVerificationStatus = status;
  saveAccounts(accounts);
  return sanitizeUser(accounts[index]);
}

/**
 * Selected purpose helpers for cross-route preservation.
 */
export function getSavedPurpose() {
  return sessionStorage.getItem(STORAGE_KEYS.SELECTED_PURPOSE) || null;
}

export function savePurpose(purpose) {
  if (purpose) {
    sessionStorage.setItem(STORAGE_KEYS.SELECTED_PURPOSE, purpose);
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.SELECTED_PURPOSE);
  }
}

/**
 * Saves or updates external user from database API into local accounts
 */
export function saveExternalUser(user) {
  if (!user || !user.id) return;
  const accounts = getAccounts();
  const index = accounts.findIndex((a) => a.id === user.id || a.email === user.email);
  if (index >= 0) {
    accounts[index] = { ...accounts[index], ...user };
  } else {
    accounts.push(user);
  }
  saveAccounts(accounts);
  saveSession({ userId: user.id, authenticatedAt: new Date().toISOString() });
}
