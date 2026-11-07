import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

/**
 * Vistaraz Authentication Context
 * 
 * Provides reactive authentication state backed by Better Auth and the Express backend.
 * Uses HTTP-only cookies with server-controlled sessions and RBAC.
 */
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  roles: [],
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from backend on initial mount
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      console.warn('[AuthProvider] Failed to restore session:', err);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[AuthProvider] Initial session check error:', err);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const loggedInUser = await authService.login({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async ({ name, email, password, role, helperDetails }) => {
    const registeredUser = await authService.register({
      name,
      email,
      password,
      role,
      helperDetails,
    });
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    return authService.updateCurrentUser(updates);
  }, []);

  const isAuthenticated = Boolean(user);
  const roles = user?.roles || (user?.role ? [user.role] : []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        roles,
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
