import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

/**
 * Vistaraz Authentication Context
 * 
 * Provides reactive authentication state backed by the local mock auth service.
 * Supports persistent sessions across refreshes and tab synchronisation.
 */
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('[AuthProvider] Failed to restore session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }

    // Keep session in sync if another window/tab modifies storage
    const handleStorageChange = (e) => {
      if (e.key === 'vistaraz_session' || e.key === 'vistaraz_accounts') {
        const updated = authService.getCurrentUser();
        setUser(updated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const loggedInUser = await authService.login({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    const registeredUser = await authService.register({ name, email, password, role });
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
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

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        setUser,
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
