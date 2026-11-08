import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Enforces server-verified authentication, role-based access control,
 * and first-time Seeker Profile verification.
 * 
 * @param {React.ReactNode} children - Target component
 * @param {Array<string>} [allowedRoles] - Roles permitted ('support_seeker', 'user', 'helper', etc.)
 * @param {boolean} [requireVerifiedHelper] - If true, requires helperVerificationStatus === 'verified'
 * @param {boolean} [requireSeekerProfile] - If true, requires seeker profile setup completed
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  requireVerifiedHelper = false,
  requireSeekerProfile = false,
}) {
  const {
    user,
    isAuthenticated,
    loading,
    profileLoading,
    isSeekerProfileCompleted,
  } = useAuth();
  const location = useLocation();

  if (loading || (profileLoading && requireSeekerProfile)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          fontFamily: 'var(--vz-font-sans)',
          color: 'var(--vz-text-muted)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--vz-border-light)',
              borderTopColor: 'var(--vz-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p>Verifying sanctuary session...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login with original intended destination preserved
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

  // Check role authorization if role restrictions are defined
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    const userRoles = Array.isArray(user.roles) ? user.roles : [userRole];

    const hasAllowedRole = allowedRoles.some((allowed) => {
      // Alias matching for support seekers: 'user' <=> 'support_seeker'
      if (allowed === 'support_seeker' || allowed === 'user') {
        return (
          userRole === 'support_seeker' ||
          userRole === 'user' ||
          userRoles.includes('user') ||
          userRoles.includes('support_seeker')
        );
      }
      return userRole === allowed || userRoles.includes(allowed);
    });

    if (!hasAllowedRole) {
      // If a support seeker attempts to access helper routes:
      if (userRole === 'support_seeker' || userRole === 'user') {
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

      // If a helper attempts to access support seeker routes:
      if (userRole === 'helper') {
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

      // Fallback redirect for other unallowed roles
      return (
        <Navigate
          to="/dashboard"
          replace
          state={{
            warningMessage: 'Access restricted: You do not have permission for this section.',
          }}
        />
      );
    }
  }

  // Helper verification guard: block unverified helpers from live listener portal
  if (
    requireVerifiedHelper &&
    (user.role === 'helper' || user.roles?.includes('helper')) &&
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

  // Seeker profile verification guard: block seekers without completed profile from Client Dashboard
  const isSeeker = user.role === 'support_seeker' || user.role === 'user';
  if (requireSeekerProfile && isSeeker && !isSeekerProfileCompleted) {
    return (
      <Navigate
        to="/seeker-setup"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return children;
}
