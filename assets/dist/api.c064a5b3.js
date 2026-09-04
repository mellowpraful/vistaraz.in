/**
 * Vistaraz Supabase Integration Module
 * Project: gofbwewcncdcyyxbnuuo
 */

const SUPABASE_CONFIG = {
  url: 'https://gofbwewcncdcyyxbnuuo.supabase.co',
  anonKey: window.VISTARAZ_SUPABASE_KEY || 'sb_publishable_aS-QJGiL3jI_buqWQbFk2A_yhmZMkQx'
};

// Lazy-init: client is created on first use, avoiding CDN race conditions
let _supabase = null;

function getClient() {
  if (_supabase) return _supabase;

  // Try window.supabase (CDN UMD bundle)
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    _supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return _supabase;
  }

  // Try globalThis.supabase (some CDN variants)
  if (typeof globalThis !== 'undefined' && globalThis.supabase && globalThis.supabase.createClient) {
    _supabase = globalThis.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return _supabase;
  }

  console.error('[Vistaraz] Supabase SDK not found. Ensure @supabase/supabase-js is loaded before api.js.');
  return null;
}

/**
 * Humanize and normalize technical errors into empathetic sanctuary messages
 */
function normalizeApiError(err) {
  if (!err) return { message: 'An unexpected pause occurred. Please try again.' };
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      message: 'You appear to be offline. Please check your internet connection.',
      code: 'OFFLINE',
      original: err
    };
  }

  const raw = (err.message || err.error_description || String(err)).toLowerCase();

  if (raw.includes('failed to fetch') || raw.includes('networkerror') || raw.includes('network request failed')) {
    return {
      message: 'Unable to reach the sanctuary servers right now. Please check your connection and retry.',
      code: 'NETWORK_ERROR',
      original: err
    };
  }

  if (raw.includes('timeout') || raw.includes('timed out') || raw.includes('abort')) {
    return {
      message: 'The request took longer than expected to complete. Please try again.',
      code: 'TIMEOUT',
      original: err
    };
  }

  if (raw.includes('invalid login credentials') || raw.includes('invalid credentials')) {
    return {
      message: 'Incorrect email or password. Please verify and try again.',
      code: 'INVALID_CREDENTIALS',
      original: err
    };
  }

  if (raw.includes('user already registered') || raw.includes('unique constraint')) {
    return {
      message: 'An account with this email already exists. Try signing in instead.',
      code: 'USER_EXISTS',
      original: err
    };
  }

  if (raw.includes('jwt expired') || raw.includes('token expired') || raw.includes('session expired')) {
    return {
      message: 'Your sanctuary session has expired for your safety. Please sign in again.',
      code: 'SESSION_EXPIRED',
      original: err
    };
  }

  if (raw.includes('rate limit') || raw.includes('too many requests')) {
    return {
      message: 'Please take a brief pause before trying again (rate limit reached).',
      code: 'RATE_LIMITED',
      original: err
    };
  }

  return {
    message: err.message || 'Something unexpected occurred. Please try again.',
    code: err.code || 'UNKNOWN',
    original: err
  };
}

/**
 * Executes an async operation with resilience (VzRetry if available) and timeout guard
 */
async function executeResilient(fn, options = {}) {
  const timeoutMs = options.timeoutMs || 10000;
  const maxRetries = options.maxRetries !== undefined ? options.maxRetries : 2;

  const wrappedFn = () => {
    return new Promise((resolve, reject) => {
      let timer = null;
      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          reject(new Error('Request timed out after ' + (timeoutMs / 1000) + 's'));
        }, timeoutMs);
      }

      Promise.resolve(fn())
        .then(res => {
          if (timer) clearTimeout(timer);
          if (res && res.error) {
            // If Supabase returned an error object, check if it's transient
            const errMsg = (res.error.message || '').toLowerCase();
            if (errMsg.includes('failed to fetch') || errMsg.includes('500') || errMsg.includes('502') || errMsg.includes('503')) {
              reject(res.error);
            } else {
              resolve(res);
            }
          } else {
            resolve(res);
          }
        })
        .catch(err => {
          if (timer) clearTimeout(timer);
          reject(err);
        });
    });
  };

  try {
    if (window.VzRetry && typeof window.VzRetry.run === 'function') {
      return await window.VzRetry.run(wrappedFn, { retries: maxRetries, baseDelay: 800 });
    }
    return await wrappedFn();
  } catch (err) {
    return { error: normalizeApiError(err) };
  }
}

/**
 * Authentication Service
 */
const VistarazAuth = {
  // Sign up with Email and Password
  async signUp(email, password, metadata = {}) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase SDK not loaded — check your internet connection and refresh.' } };

    return executeResilient(async () => {
      const res = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName || '',
            nickname: metadata.nickname || 'Friend',
            role: metadata.role || 'user',
            avatar_url: metadata.avatarUrl || '🦊',
            qualification: metadata.qualification || null,
            languages: metadata.languages || ['English']
          }
        }
      });
      if (res.error) res.error = normalizeApiError(res.error);
      return res;
    }, { maxRetries: 0 }); // Auth mutations should not auto-retry blind
  },

  // Sign in with Email and Password
  async signIn(email, password) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase SDK not loaded — check your internet connection and refresh.' } };

    return executeResilient(async () => {
      const res = await sb.auth.signInWithPassword({ email, password });
      if (res.error) res.error = normalizeApiError(res.error);
      return res;
    }, { maxRetries: 0 });
  },

  // Sign out
  async signOut(redirectTo = 'index.html') {
    const sb = getClient();
    try {
      if (sb && sb.auth) {
        await sb.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      console.error('[VistarazAuth.signOut]', err);
    } finally {
      // Force clear all auth & Supabase session keys from localStorage and sessionStorage
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth') || key.includes('vz-user') || key.includes('session'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
      } catch (storageErr) {
        console.error('[VistarazAuth.signOut] storage clear error:', storageErr);
      }

      if (redirectTo) {
        window.location.replace(redirectTo);
      }
    }
  },

  // Get current active session user (safe — never throws)
  async getUser() {
    const sb = getClient();
    if (!sb) return null;
    try {
      const res = await executeResilient(async () => {
        return await sb.auth.getUser();
      }, { maxRetries: 1, timeoutMs: 7000 });

      if (res && res.data && res.data.user) {
        return res.data.user;
      }
      return null;
    } catch (err) {
      console.error('[VistarazAuth.getUser]', err);
      return null;
    }
  },

  // Get user profile details (safe — never throws)
  async getProfile(userId) {
    const sb = getClient();
    if (!sb || !userId) return null;
      const res = await executeResilient(async () => {
        return await sb
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
      }, { maxRetries: 2, timeoutMs: 8000 });

      if (res && res.data) {
        return res.data;
      }
      if (res && res.error) {
        console.error('[VistarazAuth.getProfile]', res.error);
      }
      return null;
    } catch (err) {
      console.error('[VistarazAuth.getProfile]', err);
      return null;
    }
  },

  // Listen to Auth State Changes
  onAuthStateChange(callback) {
    const sb = getClient();
    if (!sb) return null;
    return sb.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

/**
 * Database Services
 */
const VistarazDB = {
  // Save assessment result
  async saveAssessment({ score, category, answers = {}, notes = '' }) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };

    return executeResilient(async () => {
      const user = await VistarazAuth.getUser();
      const res = await sb.from('assessments').insert([{
        user_id: user ? user.id : null,
        score,
        category,
        answers,
        notes
      }]);
      if (res.error) res.error = normalizeApiError(res.error);
      return res;
    }, { maxRetries: 1 });
  },

  // Update counselor availability
  async updateCounselorStatus(isOnline) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };

    return executeResilient(async () => {
      const user = await VistarazAuth.getUser();
      if (!user) return { error: { message: 'Must be logged in to update status' } };
      const res = await sb.from('counselor_schedules').upsert({
        counselor_id: user.id,
        is_online: isOnline,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'counselor_id' });
      if (res.error) res.error = normalizeApiError(res.error);
      return res;
    }, { maxRetries: 1 });
  },

  // Update counselor schedule
  async saveCounselorSchedule({ startTime, endTime, activeDays, maxDailySessions }) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };

    return executeResilient(async () => {
      const user = await VistarazAuth.getUser();
      if (!user) return { error: { message: 'Must be logged in' } };
      const res = await sb.from('counselor_schedules').upsert({
        counselor_id: user.id,
        start_time: startTime,
        end_time: endTime,
        active_days: activeDays,
        max_daily_sessions: maxDailySessions,
        updated_at: new Date().toISOString()
      }, { onConflict: 'counselor_id' });
      if (res.error) res.error = normalizeApiError(res.error);
      return res;
    }, { maxRetries: 1 });
  },

  // Submit contact message
  async submitContactMessage({ name, email, subject, message }) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };

    return executeResilient(async () => {
      const res = await sb.from('contact_messages').insert([{ name, email, subject, message }]);
      if (res.error) res.error = normalizeApiError(res.error);
      return res;
    }, { maxRetries: 1 });
  }
};

// Export to global scope
window.VistarazAuth = VistarazAuth;
window.VistarazDB = VistarazDB;
window.normalizeApiError = normalizeApiError;
