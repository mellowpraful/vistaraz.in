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
 * Authentication Service
 */
const VistarazAuth = {
  // Sign up with Email and Password
  async signUp(email, password, metadata = {}) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase SDK not loaded — check your internet connection and refresh.' } };
    try {
      return await sb.auth.signUp({
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
    } catch (err) {
      console.error('[VistarazAuth.signUp]', err);
      return { error: { message: err.message || 'Sign-up failed. Please try again.' } };
    }
  },

  // Sign in with Email and Password
  async signIn(email, password) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase SDK not loaded — check your internet connection and refresh.' } };
    try {
      return await sb.auth.signInWithPassword({ email, password });
    } catch (err) {
      console.error('[VistarazAuth.signIn]', err);
      return { error: { message: err.message || 'Unable to sign in right now. Please try again.' } };
    }
  },

  // Sign out
  async signOut() {
    const sb = getClient();
    if (!sb) { window.location.href = 'index.html'; return; }
    try {
      await sb.auth.signOut();
    } catch (err) {
      console.error('[VistarazAuth.signOut]', err);
    } finally {
      window.location.href = 'index.html';
    }
  },

  // Get current active session user (safe — never throws)
  async getUser() {
    const sb = getClient();
    if (!sb) return null;
    try {
      const { data: { user } } = await sb.auth.getUser();
      return user;
    } catch (err) {
      console.error('[VistarazAuth.getUser]', err);
      return null;
    }
  },

  // Get user profile details (safe — never throws)
  async getProfile(userId) {
    const sb = getClient();
    if (!sb) return null;
    try {
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('[VistarazAuth.getProfile]', error);
        return null;
      }
      return data;
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
    try {
      const user = await VistarazAuth.getUser();
      return await sb.from('assessments').insert([{
        user_id: user ? user.id : null,
        score,
        category,
        answers,
        notes
      }]);
    } catch (err) {
      console.error('[VistarazDB.saveAssessment]', err);
      return { error: { message: err.message } };
    }
  },

  // Update counselor availability
  async updateCounselorStatus(isOnline) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };
    try {
      const user = await VistarazAuth.getUser();
      if (!user) return { error: { message: 'Must be logged in to update status' } };
      return await sb.from('counselor_schedules').upsert({
        counselor_id: user.id,
        is_online: isOnline,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'counselor_id' });
    } catch (err) {
      console.error('[VistarazDB.updateCounselorStatus]', err);
      return { error: { message: err.message } };
    }
  },

  // Update counselor schedule
  async saveCounselorSchedule({ startTime, endTime, activeDays, maxDailySessions }) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };
    try {
      const user = await VistarazAuth.getUser();
      if (!user) return { error: { message: 'Must be logged in' } };
      return await sb.from('counselor_schedules').upsert({
        counselor_id: user.id,
        start_time: startTime,
        end_time: endTime,
        active_days: activeDays,
        max_daily_sessions: maxDailySessions,
        updated_at: new Date().toISOString()
      }, { onConflict: 'counselor_id' });
    } catch (err) {
      console.error('[VistarazDB.saveCounselorSchedule]', err);
      return { error: { message: err.message } };
    }
  },

  // Submit contact message
  async submitContactMessage({ name, email, subject, message }) {
    const sb = getClient();
    if (!sb) return { error: { message: 'Supabase client not initialized' } };
    try {
      return await sb.from('contact_messages').insert([{ name, email, subject, message }]);
    } catch (err) {
      console.error('[VistarazDB.submitContactMessage]', err);
      return { error: { message: err.message } };
    }
  }
};

// Export to global scope
window.VistarazAuth = VistarazAuth;
window.VistarazDB = VistarazDB;
