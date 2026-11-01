import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * Enforces authentication and role-based access control.
 * 
 * @param {React.ReactNode} children - Target component
 * @param {Array<string>} [allowedRoles] - Roles permitted ('support_seeker', 'seeker', 'helper', 'provider')
 * @param {string} [requiredRole] - Specific required role
 * @param {boolean} [requireVerifiedHelper] - If true, requires helper verification
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredRole,
  requireVerifiedHelper = false,
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontFamily: 'var(--vz-font-sans)',
        color: 'var(--vz-text-muted)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--vz-border-light)',
            borderTopColor: 'var(--vz-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Verifying sanctuary session...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          warningMessage: 'Please sign in to access this protected area.',
        }}
      />
    );
  }

  // Normalize roles: 'seeker' == 'support_seeker', 'provider' == 'helper'
  const userRole = user.role === 'provider' ? 'helper' : (user.role === 'seeker' ? 'support_seeker' : user.role);

  // Check requiredRole if specified
  if (requiredRole) {
    const targetRole = requiredRole === 'provider' ? 'helper' : (requiredRole === 'seeker' ? 'support_seeker' : requiredRole);
    if (userRole !== targetRole && user.role !== 'admin') {
      return (
        <Navigate
          to={userRole === 'helper' ? '/listener-portal' : '/client-panel'}
          replace
          state={{
            warningMessage: 'Access restricted: Insufficient permissions for this area.',
          }}
        />
      );
    }
  }

  // Check allowedRoles if specified
  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map((r) =>
      r === 'provider' ? 'helper' : (r === 'seeker' ? 'support_seeker' : r)
    );
    if (!normalizedAllowed.includes(userRole) && user.role !== 'admin') {
      if (userRole === 'support_seeker') {
        return (
          <Navigate
            to="/client-panel"
            replace
            state={{
              warningMessage: 'Access restricted: This area is reserved for Vistaraz Helpers.',
            }}
          />
        );
      }
      if (userRole === 'helper') {
        const destination =
          user.is_verified || user.helperVerificationStatus === 'verified'
            ? '/listener-portal'
            : '/helper-application';
        return (
          <Navigate
            to={destination}
            replace
            state={{
              warningMessage: 'Access restricted: Client Panel is reserved for Support Seekers.',
            }}
          />
        );
      }
    }
  }

  // Helper verification guard
  if (
    requireVerifiedHelper &&
    (userRole === 'helper' || user.role === 'provider') &&
    !user.is_verified &&
    user.helperVerificationStatus !== 'verified'
  ) {
    return (
      <Navigate
        to="/helper-application"
        replace
        state={{
          warningMessage:
            'Your helper application is pending verification. Verified listener access is required to enter the live queue.',
        }}
      />
    );
  }

  return children;
}
