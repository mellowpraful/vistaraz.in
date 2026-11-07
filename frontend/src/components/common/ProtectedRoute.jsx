import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Enforces authentication and role-based access control.
 * 
 * @param {React.ReactNode} children - Target component
 * @param {Array<string>} [allowedRoles] - Roles permitted ('support_seeker', 'helper')
 * @param {boolean} [requireVerifiedHelper] - If true, requires helperVerificationStatus === 'verified'
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
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

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a support seeker tries to access helper routes:
    if (user.role === 'support_seeker') {
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
    // If a helper tries to access support seeker routes:
    if (user.role === 'helper') {
      const destination =
        user.helperVerificationStatus === 'verified'
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

  // Helper verification guard
  if (
    requireVerifiedHelper &&
    user.role === 'helper' &&
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
