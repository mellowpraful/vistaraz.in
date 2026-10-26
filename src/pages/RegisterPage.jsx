import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Check, Sparkles, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSavedPurpose, savePurpose } from '../services/authService';
import './RegisterPage.css';

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

const SANCTUARY_FEATURES = [
  {
    icon: '🌬️',
    title: 'Box Breathing Studio',
    desc: '4-4-4-4 rhythm grounding and autonomic calming exercises.'
  },
  {
    icon: '💬',
    title: 'Encrypted Peer Circles',
    desc: 'Safeguarded peer support rooms with zero permanent logs.'
  },
  {
    icon: '📊',
    title: '2-Min Wellbeing Check-In',
    desc: 'Non-diagnostic emotional snapshot across 10 vital life areas.'
  },
  {
    icon: '🤝',
    title: 'Verified Active Listeners',
    desc: 'Trained psychology students and compassionate care peers.'
  }
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  // Role discovery & preservation
  const rawRole = searchParams.get('role');
  const [role, setRole] = useState(() => {
    if (rawRole === 'helper' || rawRole === 'provider') return 'helper';
    if (rawRole === 'support_seeker' || rawRole === 'seeker') return 'support_seeker';
    const saved = getSavedPurpose();
    if (saved === 'helper' || saved === 'support_seeker') return saved;
    return null;
  });

  // Redirect to Purpose Selection if no role is chosen
  useEffect(() => {
    if (!role) {
      navigate('/get-started', { replace: true });
    } else {
      savePurpose(role);
    }
  }, [role, navigate]);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Validation State
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(null);

  // If redirecting, don't flash form
  if (!role) {
    return null;
  }

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Please enter your name or display pseudonym.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Please enter a password.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!agreeTerms) {
      errs.terms = 'Please accept the Terms & Sanctuary Rules to continue.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setGoogleNotice(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const newUser = await register({
        name,
        email,
        password,
        role,
      });

      // Role-Based Next Journey Redirect
      if (newUser.role === 'support_seeker') {
        navigate('/assessment', { replace: true });
      } else if (newUser.role === 'helper') {
        navigate('/helper-application', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = (e) => {
    e.preventDefault();
    setGoogleNotice('Google sign-in is coming soon. Please use your email and password.');
  };

  const isSeeker = role === 'support_seeker';

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
          <h1 className="vz-auth-title">Create your account</h1>
          <p className="vz-auth-subtitle">
            Join the Vistaraz sanctuary for confidential support and empathetic care.
          </p>

          {/* Dynamic Selected-Role Confirmation Card */}
          <div
            id="role-confirmation-card"
            className={`vz-role-badge-card ${isSeeker ? 'vz-role-badge-card--seeker' : 'vz-role-badge-card--helper'}`}
            role="region"
            aria-label="Selected Role Confirmation"
          >
            <div className="vz-role-badge-card__info">
              <span className="vz-role-badge-card__icon">{isSeeker ? '🌿' : '🤝'}</span>
              <div>
                <h2 className="vz-role-badge-card__title">
                  {isSeeker ? 'Signing up as: Support Seeker' : 'Signing up as: Aspiring Helper'}
                </h2>
                <p className="vz-role-badge-card__subtitle">
                  {isSeeker
                    ? 'Explore wellbeing resources and find suitable support.'
                    : 'Create an account to begin your helper application.'}
                </p>
              </div>
            </div>
            <Link to="/get-started" className="vz-role-badge-card__change" id="change-role-link">
              Change
            </Link>
          </div>

          {/* Google Sign-In: UI Only */}
          <button
            type="button"
            id="register-google-btn"
            className="vz-google-btn"
            onClick={handleGoogleClick}
            aria-label="Sign up with Google (Coming soon)"
          >
            <GoogleIcon />
            <span>Sign up with Google</span>
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
            <div className="vz-auth-banner-error" id="register-general-error" role="alert">
              <AlertCircle size={18} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form className="vz-auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name / Display Name */}
            <div className="vz-auth-field">
              <label htmlFor="register-name" className="vz-auth-label">
                Name or Display Pseudonym
              </label>
              <input
                type="text"
                id="register-name"
                name="name"
                className={`vz-auth-input ${errors.name ? 'vz-auth-input--error' : ''}`}
                placeholder={isSeeker ? 'e.g. Maya or PeacefulOtter' : 'e.g. Dr. Jordan Reed'}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                autoComplete="name"
                required
              />
              {errors.name && <span className="vz-auth-field-error">{errors.name}</span>}
            </div>

            {/* Email Address */}
            <div className="vz-auth-field">
              <label htmlFor="register-email" className="vz-auth-label">
                Email Address
              </label>
              <input
                type="email"
                id="register-email"
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
              <label htmlFor="register-password" className="vz-auth-label">
                Password
              </label>
              <div className="vz-auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  name="password"
                  className={`vz-auth-input vz-auth-input--pw ${errors.password ? 'vz-auth-input--error' : ''}`}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  autoComplete="new-password"
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
            </div>

            {/* Confirm Password */}
            <div className="vz-auth-field">
              <label htmlFor="register-confirm-password" className="vz-auth-label">
                Confirm Password
              </label>
              <div className="vz-auth-input-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="register-confirm-password"
                  name="confirmPassword"
                  className={`vz-auth-input vz-auth-input--pw ${errors.confirmPassword ? 'vz-auth-input--error' : ''}`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="vz-auth-pw-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="vz-auth-field-error">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms & Sanctuary Rules Checkbox */}
            <div className="vz-auth-terms">
              <label className="vz-auth-terms-label">
                <input
                  type="checkbox"
                  id="register-terms"
                  className="vz-auth-terms-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: null }));
                  }}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/rules" target="_blank" className="vz-auth-terms-link">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and Sanctuary Safety Rules.
                </span>
              </label>
              {errors.terms && <span className="vz-auth-field-error">{errors.terms}</span>}
            </div>

            {/* Short Privacy Reassurance */}
            <div className="vz-auth-privacy-note">
              <ShieldCheck size={18} style={{ color: 'var(--vz-status-online)', flexShrink: 0 }} />
              <span>
                Privacy Reassurance: We never request mental-health diagnostic records during registration.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="register-submit-btn"
              className="vz-auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="vz-auth-spinner" />
                  <span>Creating sanctuary account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="vz-auth-switch">
            <span>Already have an account?</span>
            <Link to={`/login?role=${role}`} className="vz-auth-switch-link" id="link-to-login">
              Log in
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

      {/* ── RIGHT COLUMN: VISUAL / BRAND-CONTENT PANEL (ElevenLabs reference) ── */}
      <aside className="vz-auth-visual" aria-hidden="true">
        <div className="vz-auth-visual__header">
          <div className="vz-auth-visual__badge">
            <Sparkles size={14} />
            <span>Vistaraz Sanctuary Platform</span>
          </div>
          <h2 className="vz-auth-visual__headline">
            A safe space to understand what you're feeling and <em>reach out.</em>
          </h2>
        </div>

        {/* Sanctuary Showcase Tiles */}
        <div className="vz-auth-tiles-grid">
          {SANCTUARY_FEATURES.map((item, idx) => (
            <div key={idx} className="vz-auth-tile">
              <div className="vz-auth-tile__icon">{item.icon}</div>
              <div>
                <h3 className="vz-auth-tile__title">{item.title}</h3>
                <p className="vz-auth-tile__desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Footer */}
        <div className="vz-auth-visual__footer">
          <p className="vz-auth-visual__quote">
            "You don’t have to figure everything out alone. Anonymous peer support, clinical safety, and youth-centered mental wellbeing."
          </p>
          <div className="vz-auth-visual__nav-btns">
            <span className="vz-auth-visual__circle-btn"><ChevronLeft size={18} /></span>
            <span className="vz-auth-visual__circle-btn"><ChevronRight size={18} /></span>
          </div>
        </div>
      </aside>
    </div>
  );
}
