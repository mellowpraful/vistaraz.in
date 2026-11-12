import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck, HeartHandshake, Sparkles, Heart } from 'lucide-react';
import { savePurpose } from '../services/authService';
import { resolveAuthRedirect, setStoredRedirect } from '../utils/redirectHelper';
import './PurposeSelectionPage.css';

/**
 * PurposeSelectionPage
 * 
 * Step 2 of the core Vistaraz onboarding flow:
 * Homepage -> Get Started -> Purpose Selection -> Login/Register -> Relevant User Journey
 * 
 * Offers two pathways:
 * A. I'm looking for support (role: 'support_seeker')
 * B. I want to support others (role: 'helper')
 */
export default function PurposeSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const redirectTarget = resolveAuthRedirect(searchParams, location);

  useEffect(() => {
    if (redirectTarget) {
      setStoredRedirect(redirectTarget);
    }
  }, [redirectTarget]);

  const handleSelectPurpose = (role) => {
    savePurpose(role);
    const q = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : '';
    navigate(`/register?role=${role}${q}`);
  };

  const loginUrl = redirectTarget
    ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
    : '/login';

  return (
    <div className="vz-purpose-page">
      <div className="vz-purpose-container">
        {/* Navigation Bar */}
        <header className="vz-purpose-nav">
          <Link to="/" className="vz-purpose-logo" aria-label="Vistaraz Home">
            <img src="/logo.png" alt="Vistaraz" height="48" />
          </Link>

          <Link to={loginUrl} className="vz-purpose-login-link">
            Already have an account? <strong>Log in</strong>
          </Link>
        </header>

        {/* Header Block */}
        <div className="vz-purpose-header">
          <span className="vz-purpose-eyebrow">CHOOSE YOUR PATHWAY</span>
          <h1 className="vz-purpose-title">How would you like to use Vistaraz?</h1>
          <p className="vz-purpose-desc">
            Vistaraz connects youth seeking emotional support with compassionate, trained listeners in a safe, judgment-free sanctuary. Select your purpose to begin.
          </p>
        </div>

        {/* Options Grid */}
        <div className="vz-purpose-grid">
          {/* Option A: Support Seeker */}
          <button
            type="button"
            id="purpose-support-seeker-btn"
            className="vz-purpose-card vz-purpose-card--seeker"
            onClick={() => handleSelectPurpose('support_seeker')}
            aria-label="Select pathway: I'm looking for support"
          >
            <div className="vz-purpose-card__icon-wrap">
              🌿
            </div>
            <span className="vz-purpose-card__badge">Support Seeker</span>
            <h2 className="vz-purpose-card__title">I'm looking for support</h2>
            <p className="vz-purpose-card__desc">
              Explore wellbeing resources, complete a 2-minute check-in, chat anonymously, and find suitable peer and professional support.
            </p>

            <ul className="vz-purpose-card__features">
              <li className="vz-purpose-card__feature-item">
                <Check size={16} /> 100% private & anonymous identity options
              </li>
              <li className="vz-purpose-card__feature-item">
                <Check size={16} /> Free grounding tools & Box Breathing studio
              </li>
              <li className="vz-purpose-card__feature-item">
                <Check size={16} /> 1-on-1 confidential chat & video support
              </li>
            </ul>

            <div className="vz-purpose-card__cta">
              <span>Continue as Support Seeker</span>
              <ArrowRight size={16} />
            </div>
          </button>

          {/* Option B: Helper */}
          <button
            type="button"
            id="purpose-helper-btn"
            className="vz-purpose-card vz-purpose-card--helper"
            onClick={() => handleSelectPurpose('helper')}
            aria-label="Select pathway: I want to support others"
          >
            <div className="vz-purpose-card__icon-wrap">
              🤝
            </div>
            <span className="vz-purpose-card__badge">Aspiring Helper</span>
            <h2 className="vz-purpose-card__title">I want to support others</h2>
            <p className="vz-purpose-card__desc">
              Create an account to begin your helper application. Join our network of trained listeners, psychology trainees, and counselors.
            </p>

            <ul className="vz-purpose-card__features">
              <li className="vz-purpose-card__feature-item">
                <Check size={16} /> Clinical supervision & safeguarding support
              </li>
              <li className="vz-purpose-card__feature-item">
                <Check size={16} /> Live incoming queue & flexible scheduling
              </li>
              <li className="vz-purpose-card__feature-item">
                <Check size={16} /> Peer training hours & certification tracking
              </li>
            </ul>

            <div className="vz-purpose-card__cta">
              <span>Begin Helper Application</span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>

        {/* Footer Reassurance */}
        <div className="vz-purpose-footer">
          <ShieldCheck size={16} style={{ color: 'var(--vz-status-online)' }} />
          <span>Vistaraz Sanctuary Safeguard: Your privacy and trust are our first priority.</span>
        </div>
      </div>
    </div>
  );
}
