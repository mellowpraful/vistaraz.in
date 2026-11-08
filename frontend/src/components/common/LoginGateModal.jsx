import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Users, Sparkles, ShieldCheck } from 'lucide-react';
import './LoginGateModal.css';

/**
 * Vistaraz Unified Login Gate Component
 * 
 * Consistent modal displayed when a guest user attempts a protected action
 * across Support, Community, Tools, and Plans pages.
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Callback to dismiss modal and return to previous state
 * @param {string} title - Heading text (default: 'Continue Your Journey')
 * @param {string} description - Descriptive subtext (default: 'Sign in to continue and explore more of Vistaraz.')
 * @param {string} badgeText - Header chip badge (default: 'Sanctuary Access')
 * @param {string} dismissText - Dismiss action text (default: 'Maybe Later')
 * @param {Function} onEmailLogin - Optional custom handler when continuing with Email
 */
export function LoginGateModal({
  isOpen,
  onClose,
  title = 'Continue Your Journey',
  description = 'Sign in to continue and explore more of Vistaraz.',
  badgeText = 'Sanctuary Access',
  dismissText = 'Maybe Later',
  onEmailLogin,
}) {
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Manage Escape key dismiss and focus trapping
  useEffect(() => {
    if (!isOpen) return;

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

  const handleEmailClick = (e) => {
    e.preventDefault();
    if (onClose) onClose();
    if (onEmailLogin) {
      onEmailLogin();
    } else {
      navigate('/register');
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
          {/* Action: Continue with Email and Password */}
          <button
            type="button"
            id="login-gate-email-btn"
            className="vz-login-gate-btn vz-login-gate-btn--email"
            onClick={handleEmailClick}
          >
            <Mail size={18} />
            <span>Continue with Email and Password</span>
          </button>

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
