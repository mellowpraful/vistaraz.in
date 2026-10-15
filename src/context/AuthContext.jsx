import React, { createContext, useContext, useState } from 'react';

/**
 * Vistaraz Authentication Context
 * 
 * Provides authentication state and contracts for future authentication integration (e.g., Supabase Auth).
 * Currently in UI-only stage: defaults to unauthenticated (guest) user.
 * Does not invent fake credentials or use localStorage flags to pretend user is logged in.
 */
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  // Real authentication is not implemented yet.
  // Defaults to null (guest / unauthenticated).
  const [user, setUser] = useState(null);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, isAuthenticated: false };
  }
  return context;
}

export default AuthContext;
