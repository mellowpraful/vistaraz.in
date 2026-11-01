import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import api, { getStoredToken, setStoredAuth, clearStoredAuth } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  updateUser: () => {},
  refreshUser: () => {},
  clearError: () => {},
  setUser: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount (from local storage and verify with backend)
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        // First check local user
        const localUser = authService.getCurrentUser();
        if (localUser && isMounted) {
          setUser(localUser);
        }

        // If a backend token exists, verify with /api/auth/me
        const storedToken = getStoredToken();
        if (storedToken) {
          try {
            const data = await api.me();
            if (isMounted && data?.user) {
              const merged = { ...localUser, ...data.user };
              setUser(merged);
              authService.updateCurrentUser(merged);
            }
          } catch (apiErr) {
            if (apiErr.status === 401 || apiErr.status === 403) {
              clearStoredAuth();
            }
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Init session notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    // Cross-tab sync
    const handleStorageChange = (e) => {
      if (e.key === 'vistaraz_session' || e.key === 'vistaraz_accounts' || e.key === 'vistaraz_auth_user') {
        const updated = authService.getCurrentUser();
        setUser(updated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      // 1. Try real Neon backend API
      let loggedUser = null;
      try {
        const res = await api.login({ email, password });
        if (res?.user) {
          loggedUser = {
            ...res.user,
            role: res.user.role === 'provider' ? 'helper' : (res.user.role === 'seeker' ? 'support_seeker' : res.user.role)
          };
          setToken(res.token);
          setStoredAuth(res.token, loggedUser);
        }
      } catch (backendErr) {
        console.warn('Backend login notice, checking local accounts:', backendErr.message);
      }

      // 2. If backend didn't connect, fallback to authService
      if (!loggedUser) {
        loggedUser = await authService.login({ email, password });
      }

      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async ({ name, email, password, role, nickname, avatar, qualification, languages }) => {
    setError(null);
    try {
      let registeredUser = null;
      const normalizedRole = role === 'helper' || role === 'provider' ? 'provider' : 'seeker';

      // 1. Try real Neon backend API
      try {
        const res = await api.register({
          name: name || nickname || 'Friend',
          nickname: nickname || name || 'Friend',
          email,
          password,
          role: normalizedRole,
          avatar: avatar || (normalizedRole === 'provider' ? '🦉' : '🦊'),
          qualification: qualification || (normalizedRole === 'provider' ? 'Trained Peer Listener' : null),
          languages: languages || ['English']
        });
        if (res?.user) {
          registeredUser = {
            ...res.user,
            role: role === 'helper' ? 'helper' : 'support_seeker',
            helperVerificationStatus: role === 'helper' ? 'pending' : 'none'
          };
          setToken(res.token);
          setStoredAuth(res.token, registeredUser);
        }
      } catch (backendErr) {
        console.warn('Backend register notice, using local service:', backendErr.message);
      }

      // 2. Fallback / sync with local authService
      if (!registeredUser) {
        registeredUser = await authService.register({ name, email, password, role });
      } else {
        // Also persist in authService so local utilities work
        authService.saveExternalUser(registeredUser);
      }

      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (_) {}
    authService.logout();
    clearStoredAuth();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = authService.updateCurrentUser(updates);
    if (updated) {
      setUser(updated);
    }
    return updated;
  }, []);

  const refreshUser = useCallback(() => {
    const fresh = authService.getCurrentUser();
    setUser(fresh);
    return fresh;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        signIn: login,
        signUp: register,
        signOut: logout,
        updateUser,
        refreshUser,
        clearError,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
