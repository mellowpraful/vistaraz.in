import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getStoredToken, getStoredUser, clearStoredAuth, setStoredAuth } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUser: () => {},
  clearError: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify session on mount with /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await api.me();
        if (isMounted && data?.user) {
          setUser(data.user);
          setStoredAuth(storedToken, data.user);
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        // If unauthorized or token invalid, clear local auth
        if (err.status === 401 || err.status === 403) {
          clearStoredAuth();
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (payload) => {
    setError(null);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch (_) {
      // Ignored
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
    }
  }, []);

  const updateUser = useCallback((fields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      setStoredAuth(getStoredToken(), updated);
      return updated;
    });
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
        signIn,
        signUp,
        signOut,
        updateUser,
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
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      updateUser: () => {},
      clearError: () => {}
    };
  }
  return context;
}

export default AuthContext;
