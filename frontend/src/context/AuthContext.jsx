import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

/**
 * Vistaraz Authentication Context
 * 
 * Provides reactive authentication state backed by Better Auth and the Express backend.
 * Uses HTTP-only cookies with server-controlled sessions, RBAC, and Seeker Profile status.
 */
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  roles: [],
  seekerProfile: null,
  isSeekerProfileCompleted: false,
  profileLoading: false,
  checkSeekerProfile: async () => ({ profileExists: false, data: null }),
  setSeekerProfile: () => {},
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
  const [seekerProfile, setSeekerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Checks seeker profile directly from NeonDB
  const checkSeekerProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await authService.getSeekerProfile();
      if (res && res.profileExists && res.data) {
        setSeekerProfile(res.data);
        return { profileExists: true, data: res.data };
      } else {
        setSeekerProfile(null);
        return { profileExists: false, data: null };
      }
    } catch (err) {
      console.warn('[AuthProvider] Failed to check seeker profile:', err);
      setSeekerProfile(null);
      return { profileExists: false, data: null };
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Restore authenticated session from backend on initial mount
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser && (currentUser.role === 'support_seeker' || currentUser.role === 'user')) {
        if (currentUser.seekerProfile) {
          setSeekerProfile(currentUser.seekerProfile);
        } else {
          await checkSeekerProfile();
        }
      } else {
        setSeekerProfile(null);
      }
      return currentUser;
    } catch (err) {
      console.warn('[AuthProvider] Failed to restore session:', err);
      setUser(null);
      setSeekerProfile(null);
      return null;
    }
  }, [checkSeekerProfile]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          if (currentUser && (currentUser.role === 'support_seeker' || currentUser.role === 'user')) {
            if (currentUser.seekerProfile) {
              setSeekerProfile(currentUser.seekerProfile);
            } else {
              const res = await authService.getSeekerProfile();
              if (isMounted && res && res.profileExists && res.data) {
                setSeekerProfile(res.data);
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[AuthProvider] Initial session check error:', err);
          setUser(null);
          setSeekerProfile(null);
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
    if (loggedInUser && (loggedInUser.role === 'support_seeker' || loggedInUser.role === 'user')) {
      if (loggedInUser.seekerProfile) {
        setSeekerProfile(loggedInUser.seekerProfile);
      } else {
        await checkSeekerProfile();
      }
    }
    return loggedInUser;
  }, [checkSeekerProfile]);

  const register = useCallback(async ({ name, email, password, role, helperDetails }) => {
    const registeredUser = await authService.register({
      name,
      email,
      password,
      role,
      helperDetails,
    });
    setUser(registeredUser);
    setSeekerProfile(null);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setSeekerProfile(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    return authService.updateCurrentUser(updates);
  }, []);

  const isAuthenticated = Boolean(user);
  const roles = user?.roles || (user?.role ? [user.role] : []);
  const isSeekerProfileCompleted = Boolean(
    seekerProfile?.avatarId && seekerProfile?.realName
  ) || Boolean(user?.isSeekerProfileCompleted);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        roles,
        seekerProfile,
        isSeekerProfileCompleted,
        profileLoading,
        checkSeekerProfile,
        setSeekerProfile,
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
