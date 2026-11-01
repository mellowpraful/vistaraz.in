import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute Component
 * Guards private pages (Client Panel, Listener Portal, Dashboard, Chat, Video Call)
 * and enforces role-based access control.
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        color: 'var(--vz-text-secondary)',
        fontFamily: 'var(--vz-font-base)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid #e2e8f0',
          borderTopColor: 'var(--vz-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Connecting to Sanctuary...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = `/register?action=login&from=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // Role validation
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    if (requiredRole === 'provider') {
      // Seekers trying to access provider portal are redirected to their care panel
      return <Navigate to="/client-panel" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

