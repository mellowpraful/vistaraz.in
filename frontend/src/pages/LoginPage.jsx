import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authClient } from '../services/authClient';
import { getSavedPurpose, savePurpose } from '../services/authService';
import AuthCarousel from '../components/common/AuthCarousel';
import './LoginPage.css';

/**
 * Google Brand Icon (inline SVG)
 */
function GoogleIcon() {
  return (
    <svg className="vz-google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Role detection from query or session
  const rawRole = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState(() => {
    if (rawRole === 'helper' || rawRole === 'provider') return 'helper';
    if (rawRole === 'support_seeker' || rawRole === 'seeker') return 'support_seeker';
    const saved = getSavedPurpose();
    if (saved === 'helper' || saved === 'support_seeker') return saved;
    return null;
  });

  useEffect(() => {
    if (rawRole === 'helper' || rawRole === 'provider') {
      setSelectedRole('helper');
      savePurpose('helper');
    } else if (rawRole === 'support_seeker' || rawRole === 'seeker') {
      setSelectedRole('support_seeker');
      savePurpose('support_seeker');
    }
  }, [rawRole]);

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback State
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [mismatchNotice, setMismatchNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  // Warnings passed from ProtectedRoute
  const routeWarning = location.state?.warningMessage || null;

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    }
    if (!password) {
      errs.password = 'Please enter your password.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setMismatchNotice('');
    setGoogleNotice(null);
    setForgotNotice(false);

    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login({ email, password });

      // Check for role mismatch explicitly
      if (selectedRole && user.role !== selectedRole) {
        setMismatchNotice(
          `Your registered role is "${user.role === 'helper' ? 'Aspiring Helper' : 'Support Seeker'}". Your saved role will be preserved.`
        );
        // Small delay to let user see feedback, then redirect to actual saved role
        setTimeout(() => {
          redirectUserByRole(user);
        }, 1200);
      } else {
        redirectUserByRole(user);
      }
    } catch (err) {
      setGeneralError(err.message || 'Login failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  const redirectUserByRole = (user) => {
    // If the user was trying to access a specific protected page, check if permitted
    const intendedFrom = location.state?.from?.pathname;
    if (intendedFrom && intendedFrom !== '/login' && intendedFrom !== '/register') {
      navigate(intendedFrom, { replace: true });
      return;
    }

    if (user.role === 'support_seeker' || user.role === 'user') {
      if (!user.isSeekerProfileCompleted) {
        navigate('/seeker-setup', { replace: true });
      } else if (!user.onboardingCompleted) {
        navigate('/assessment', { replace: true });
      } else {
        navigate('/client-panel', { replace: true });
      }
    } else if (user.role === 'helper') {
      if (user.helperVerificationStatus === 'verified') {
        navigate('/listener-portal', { replace: true });
      } else {
        navigate('/helper-application', { replace: true });
      }
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleClick = async (e) => {
    e.preventDefault();
    setGoogleNotice(null);
    try {
      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + (isSeeker ? '/client-panel' : '/listener-portal'),
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else if (res?.error) {
        setGoogleNotice(res.error.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setGoogleNotice(err?.message || 'Unable to connect to Google. Please check your credentials or network.');
    }
  };

  const isSeeker = selectedRole === 'support_seeker';

  return (
    <div className="vz-auth-page">
      {/* ── LEFT COLUMN: AUTHENTICATION FORM ── */}
      <main className="vz-auth-main">
        {/* Brand Header */}
        <div className="vz-auth-top-nav">
          <Link to="/" className="vz-auth-brand" aria-label="Return to Vistaraz Home">
            <img src="/logo.png" alt="Vistaraz" />
          </Link>
        </div>

        <div className="vz-auth-form-wrap">
          <h1 className="vz-auth-title">Log in to your account</h1>
          <p className="vz-auth-subtitle">
            Welcome back to Vistaraz. Sign in to access your wellbeing sanctuary.
          </p>

          {/* Route Guard Warning if redirected from protected route */}
          {routeWarning && (
            <div className="vz-auth-banner-error" style={{ marginBottom: '16px' }} role="alert">
              <AlertCircle size={18} />
              <span>{routeWarning}</span>
            </div>
          )}

          {/* Selected-Role Indicator when arriving through purpose selection */}
          {selectedRole && (
            <div
              id="login-role-indicator"
              className={`vz-role-badge-card ${isSeeker ? 'vz-role-badge-card--seeker' : 'vz-role-badge-card--helper'}`}
              role="region"
              aria-label="Intended Purpose"
            >
              <div className="vz-role-badge-card__info">
                <span className="vz-role-badge-card__icon">{isSeeker ? '🌿' : '🤝'}</span>
                <div>
                  <h2 className="vz-role-badge-card__title">
                    {isSeeker ? 'Intended Role: Support Seeker' : 'Intended Role: Aspiring Helper'}
                  </h2>
                  <p className="vz-role-badge-card__subtitle">
                    {isSeeker
                      ? 'Accessing wellbeing tools and seeker care panel.'
                      : 'Accessing helper application and listener console.'}
                  </p>
                </div>
              </div>
              <Link to="/get-started" className="vz-role-badge-card__change" id="login-change-role-link">
                Change
              </Link>
            </div>
          )}

          {/* Google Sign-In: UI Only */}
          <button
            type="button"
            id="login-google-btn"
            className="vz-google-btn"
            onClick={handleGoogleClick}
            aria-label="Sign in with Google (Coming soon)"
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>

          {/* Google Coming-Soon Feedback Notice */}
          {googleNotice && (
            <div className="vz-auth-notice" id="google-coming-soon-notice" role="status" aria-live="polite">
              <AlertCircle size={16} />
              <span>{googleNotice}</span>
            </div>
          )}

          {/* Form Divider */}
          <div className="vz-auth-divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          {/* Global Error Banner */}
          {generalError && (
            <div className="vz-auth-banner-error" id="login-general-error" role="alert">
              <AlertCircle size={18} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Role Mismatch Feedback Banner */}
          {mismatchNotice && (
            <div className="vz-auth-banner-success" id="login-mismatch-notice" role="status">
              <CheckCircle2 size={18} />
              <span>{mismatchNotice}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="vz-auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="vz-auth-field">
              <label htmlFor="login-email" className="vz-auth-label">
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                className={`vz-auth-input ${errors.email ? 'vz-auth-input--error' : ''}`}
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                autoComplete="email"
                required
              />
              {errors.email && <span className="vz-auth-field-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="vz-auth-field">
              <div className="vz-auth-field-header">
                <label htmlFor="login-password" className="vz-auth-label">
                  Password
                </label>
                <button
                  type="button"
                  className="vz-auth-forgot"
                  onClick={() => setForgotNotice(true)}
                  id="forgot-password-link"
                >
                  Forgot password?
                </button>
              </div>

              <div className="vz-auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className={`vz-auth-input vz-auth-input--pw ${errors.password ? 'vz-auth-input--error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="vz-auth-pw-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="vz-auth-field-error">{errors.password}</span>}

              {/* Forgot Password Notice */}
              {forgotNotice && (
                <div className="vz-auth-notice" role="status">
                  <AlertCircle size={16} />
                  <span>
                    Password reset instructions will be sent once the email verification backend is connected.
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              className="vz-auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="vz-auth-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Link to Register */}
          <div className="vz-auth-switch">
            <span>Don't have an account?</span>
            <Link
              to={selectedRole ? `/register?role=${selectedRole}` : '/get-started'}
              className="vz-auth-switch-link"
              id="link-to-register"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="vz-auth-bottom-footer">
          <span>&copy; {new Date().getFullYear()} Vistaraz Sanctuary</span>
          <div className="vz-auth-bottom-links">
            <Link to="/rules">Privacy &amp; Terms</Link>
            <Link to="/safety">Crisis Helpline</Link>
          </div>
        </footer>
      </main>

      {/* ── RIGHT COLUMN: FULL-BLEED AUTOMATIC SLIDING IMAGE CAROUSEL ── */}
      <AuthCarousel />
    </div>
  );
}
