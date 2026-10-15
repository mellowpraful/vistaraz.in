import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, Users, Sparkles, ShieldCheck } from 'lucide-react';
import './LoginGateModal.css';

/**
 * Google 'G' multicolor vector brand icon
 */
function GoogleIcon() {
  return (
    <svg
      className="vz-login-gate__icon-google"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
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

/**
 * Vistaraz Unified Login Gate Component
 * 
 * Consistent modal displayed when a guest user attempts a protected action
 * across Support, Community, Tools, and Plans pages.
 * 
 * UI-only implementation: does not perform fake login, call live backends, or alter auth state.
 * Readily pluggable into future authentication providers (e.g. Supabase Auth).
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Callback to dismiss modal and return to previous state
 * @param {string} title - Heading text (default: 'Continue Your Journey')
 * @param {string} description - Descriptive subtext (default: 'Sign in to continue and explore more of Vistaraz.')
 * @param {string} badgeText - Header chip badge (default: 'Sanctuary Access')
 * @param {string} dismissText - Dismiss action text (default: 'Maybe Later')
 * @param {Function} onGoogleLogin - Optional placeholder handler for Google Auth
 * @param {Function} onEmailLogin - Optional placeholder handler for Email Auth
 */
export function LoginGateModal({
  isOpen,
  onClose,
  title = 'Continue Your Journey',
  description = 'Sign in to continue and explore more of Vistaraz.',
  badgeText = 'Sanctuary Access',
  dismissText = 'Maybe Later',
  onGoogleLogin,
  onEmailLogin,
}) {
  const [placeholderNotice, setPlaceholderNotice] = useState(null);
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Manage Escape key dismiss and focus trapping
  useEffect(() => {
    if (!isOpen) {
      setPlaceholderNotice(null);
      return;
    }

    // Save previously focused element to restore on close
    previousActiveElement.current = document.activeElement;

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap Tab key inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Prevent body background scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function' &&
        previousActiveElement.current.tagName !== 'TEXTAREA' &&
        previousActiveElement.current.tagName !== 'INPUT'
      ) {
        try {
          previousActiveElement.current.focus({ preventScroll: true });
        } catch (e) {}
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleClick = (e) => {
    e.preventDefault();
    if (onGoogleLogin) {
      onGoogleLogin();
    } else {
      setPlaceholderNotice('Google authentication will be connected in an upcoming release. No credentials were requested.');
    }
  };

  const handleEmailClick = (e) => {
    e.preventDefault();
    if (onEmailLogin) {
      onEmailLogin();
    } else {
      setPlaceholderNotice('Email login will be connected in an upcoming release. No credentials were requested.');
    }
  };

  return (
    <div
      className="vz-login-gate-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vz-login-gate-title"
      aria-describedby="vz-login-gate-desc"
    >
      <div className="vz-login-gate-card" ref={modalRef}>
        {/* Dismiss Button */}
        <button
          ref={closeBtnRef}
          type="button"
          className="vz-login-gate__close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Visual Badge */}
        <div className="vz-login-gate__header-icon">
          <div className="vz-login-gate__avatar-circle">
            <Users size={26} className="vz-login-gate__hero-icon" />
          </div>
          <span className="vz-login-gate__badge">
            <Sparkles size={13} /> {badgeText}
          </span>
        </div>

        {/* Heading & Description */}
        <div className="vz-login-gate__content">
          <h2 id="vz-login-gate-title" className="vz-login-gate__title">
            {title}
          </h2>
          <p id="vz-login-gate-desc" className="vz-login-gate__desc">
            {description}
          </p>
        </div>

        {/* Privacy by Design Safeguard Note */}
        <div className="vz-login-gate__privacy-pill">
          <ShieldCheck size={16} className="vz-login-gate__privacy-icon" />
          <span>Anonymous pseudonyms · Private & peer-moderated</span>
        </div>

        {/* Action Buttons */}
        <div className="vz-login-gate__actions">
          {/* Primary Action: Continue with Google */}
          <button
            type="button"
            id="login-gate-google-btn"
            className="vz-login-gate-btn vz-login-gate-btn--google"
            onClick={handleGoogleClick}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Secondary Action: Log in with Email */}
          <button
            type="button"
            id="login-gate-email-btn"
            className="vz-login-gate-btn vz-login-gate-btn--email"
            onClick={handleEmailClick}
          >
            <Mail size={18} />
            <span>Log in with Email</span>
          </button>

          {/* UI-Only Notice (non-intrusive feedback) */}
          {placeholderNotice && (
            <div className="vz-login-gate__notice" role="status" aria-live="polite">
              <span>ℹ️ {placeholderNotice}</span>
            </div>
          )}

          {/* Alternative Action: Maybe Later */}
          <button
            type="button"
            id="login-gate-dismiss-btn"
            className="vz-login-gate-btn vz-login-gate-btn--ghost"
            onClick={onClose}
          >
            {dismissText}
          </button>
        </div>
      </div>
    </div>
  );
}

export const LoginGate = LoginGateModal;
export default LoginGateModal;
