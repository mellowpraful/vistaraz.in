/**
 * redirectHelper.js
 * 
 * Safe redirect extraction and validation for Vistaraz authentication flows.
 * Ensures users returning from login, registration, or Google OAuth
 * land back on their original intended destination (e.g. /community, /support, /tools).
 */

export function isValidRedirect(url) {
  if (!url || typeof url !== 'string') return false;
  // Must be an internal relative path starting with a single '/'
  if (!url.startsWith('/') || url.startsWith('//')) return false;

  const base = url.split('?')[0].toLowerCase().trim();
  const authRoutes = [
    '/login',
    '/register',
    '/get-started',
    '/purpose',
    '/seeker-setup',
    '/seeker/setup',
    '/signup',
  ];
  return !authRoutes.includes(base);
}

export function getStoredRedirect() {
  try {
    const val = sessionStorage.getItem('vz_auth_redirect');
    if (val && isValidRedirect(val)) return val;
  } catch (e) {}
  return null;
}

export function setStoredRedirect(url) {
  if (isValidRedirect(url)) {
    try {
      sessionStorage.setItem('vz_auth_redirect', url);
    } catch (e) {}
  }
}

export function clearStoredRedirect() {
  try {
    sessionStorage.removeItem('vz_auth_redirect');
  } catch (e) {}
}

export function resolveAuthRedirect(searchParams, location) {
  // 1. Explicit query parameter (?redirect=...)
  const fromQuery = searchParams?.get('redirect');
  if (isValidRedirect(fromQuery)) return fromQuery;

  // 2. React Router location.state?.from
  const stateFrom = location?.state?.from;
  if (typeof stateFrom === 'string' && isValidRedirect(stateFrom)) return stateFrom;
  if (stateFrom?.pathname && isValidRedirect(stateFrom.pathname)) {
    if (stateFrom.search) {
      const inner = new URLSearchParams(stateFrom.search).get('redirect');
      if (isValidRedirect(inner)) return inner;
    }
    return stateFrom.pathname + (stateFrom.search || '');
  }

  // 3. Persisted redirect from sessionStorage (e.g. across OAuth roundtrips)
  const stored = getStoredRedirect();
  if (stored) return stored;

  return null;
}

