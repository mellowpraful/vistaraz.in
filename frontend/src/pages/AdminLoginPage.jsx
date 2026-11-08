import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import './AdminLoginPage.css';

/**
 * AdminLoginPage
 * Route: /admin/login
 *
 * Dedicated administrative access gateway:
 * - Strictly verifies server-assigned 'admin' role.
 * - HTTP-only secure cookie session management.
 * - Direct URL access only (no public navbar link).
 */
export default function AdminLoginPage() {
  const { user, isAuthenticated, roles = [], login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [errors, setErrors] = useState({});

  // Route warning if redirected from protected admin route
  const routeWarning = location.state?.warningMessage || null;

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && (roles.includes('admin') || user?.role === 'admin')) {
      const returnPath = location.state?.from?.pathname || '/admin/dashboard';
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, roles, user, navigate, location]);

  const validate = () => {
    const errs = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errs.email = 'Admin email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid administrative email.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const loggedInUser = await login({ email: email.trim(), password });

      const userRoles = loggedInUser?.roles || [loggedInUser?.role];
      const isAdmin = userRoles.includes('admin');

      if (!isAdmin) {
        setGeneralError('Access denied: This account does not possess administrator privileges.');
        setLoading(false);
        return;
      }

      // Admin verified -> navigate to dashboard
      const returnPath = location.state?.from?.pathname || '/admin/dashboard';
      navigate(returnPath, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="vz-admin-auth-page">
      <div className="vz-admin-auth-card">
        {/* Header Branding */}
        <div className="vz-admin-auth-header">
          <div className="vz-admin-auth-badge">
            <Shield size={16} className="vz-admin-badge-icon" />
            <span>Vistaraz Platform Administration</span>
          </div>
          <h1 className="vz-admin-auth-title">Administrative Console</h1>
          <p className="vz-admin-auth-subtitle">
            Restricted access gateway for platform governance, peer application review, and system oversight.
          </p>
        </div>

        {/* Route Warning Banner */}
        {routeWarning && (
          <div className="vz-admin-auth-banner vz-admin-auth-banner--warning" role="alert">
            <AlertCircle size={18} />
            <span>{routeWarning}</span>
          </div>
        )}

        {/* Error Banner */}
        {generalError && (
          <div className="vz-admin-auth-banner vz-admin-auth-banner--error" role="alert">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="vz-admin-auth-form">
          {/* Email Address */}
          <div className="vz-admin-auth-field">
            <label htmlFor="admin-email" className="vz-admin-auth-label">
              Admin Email
            </label>
            <div className="vz-admin-input-wrap">
              <Mail size={18} className="vz-admin-input-icon" />
              <input
                type="email"
                id="admin-email"
                name="email"
                className={`vz-admin-auth-input ${errors.email ? 'vz-admin-auth-input--error' : ''}`}
                placeholder="admin@vistaraz.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
            {errors.email && <span className="vz-admin-field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="vz-admin-auth-field">
            <label htmlFor="admin-password" className="vz-admin-auth-label">
              Master Password
            </label>
            <div className="vz-admin-input-wrap">
              <Lock size={18} className="vz-admin-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                name="password"
                className={`vz-admin-auth-input ${errors.password ? 'vz-admin-auth-input--error' : ''}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="vz-admin-pw-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="vz-admin-field-error">{errors.password}</span>}
          </div>

          {/* Remember me option */}
          <div className="vz-admin-auth-meta">
            <label className="vz-admin-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="vz-admin-checkbox"
                disabled={loading}
              />
              <span>Keep administrative session active on this workstation</span>
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="vz-admin-submit-btn"
            disabled={loading}
            id="admin-login-submit-btn"
          >
            {loading ? (
              <>
                <span className="vz-admin-spinner" />
                <span>Verifying Administrator Credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <footer className="vz-admin-auth-footer">
          <p>
            🔒 All administrative actions are cryptographically signed and recorded in immutable platform audit logs. Unauthorized access attempts are monitored and blocked.
          </p>
        </footer>
      </div>
    </div>
  );
}

