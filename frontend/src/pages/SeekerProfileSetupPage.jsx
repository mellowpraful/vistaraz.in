import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSeekerProfile } from '../services/authService';
import { resolveAuthRedirect, clearStoredRedirect, setStoredRedirect } from '../utils/redirectHelper';
import { AVATAR_LIST, AvatarImage } from '../utils/avatars';
import { ShieldCheck, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import './SeekerProfileSetupPage.css';

/**
 * SeekerProfileSetupPage
 * 
 * First-Time Seeker Profile Setup Flow:
 * - Collects Real Name and selects 1 of 12 predefined illustrated sanctuary avatars.
 * - Saves directly to NeonDB via POST /api/users/me/profile.
 * - Redirects to the Client Dashboard upon completion.
 */
export default function SeekerProfileSetupPage() {
  const { user, isSeekerProfileCompleted, checkSeekerProfile, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Persist any explicit redirect query param
  useEffect(() => {
    const qRedirect = searchParams.get('redirect');
    if (qRedirect) {
      setStoredRedirect(qRedirect);
    }
  }, [searchParams]);

  const [realName, setRealName] = useState(user?.seekerProfile?.realName || user?.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    user?.seekerProfile?.avatarId || 'avatar_01'
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Check on mount if profile already exists in DB or state
  useEffect(() => {
    let isMounted = true;
    async function verifyAndRedirect() {
      let isCompleted = isSeekerProfileCompleted;
      if (!isCompleted && typeof checkSeekerProfile === 'function') {
        const res = await checkSeekerProfile();
        if (res && res.profileExists) {
          isCompleted = true;
        }
      }

      if (isMounted && isCompleted) {
        let returnPath = resolveAuthRedirect(searchParams, location) || '/client-panel';
        if (!returnPath || returnPath.startsWith('/seeker-setup')) {
          returnPath = '/client-panel';
        }
        clearStoredRedirect();
        window.location.href = returnPath;
      }
    }

    verifyAndRedirect();
    return () => { isMounted = false; };
  }, [isSeekerProfileCompleted, searchParams, location, checkSeekerProfile]);

  const validate = () => {
    const errs = {};
    const trimmed = (realName || '').trim();
    if (!trimmed) {
      errs.realName = 'Please enter your real name or full display name.';
    } else if (trimmed.length < 2) {
      errs.realName = 'Name must be at least 2 characters.';
    } else if (trimmed.length > 100) {
      errs.realName = 'Name cannot exceed 100 characters.';
    }

    if (!selectedAvatarId) {
      errs.avatar = 'Please choose an avatar to represent yourself.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await createSeekerProfile({
        realName: realName.trim(),
        avatarId: selectedAvatarId,
      });

      if (response.success) {
        setSuccess(true);
        let returnPath = resolveAuthRedirect(searchParams, location) || '/client-panel';
        if (!returnPath || returnPath.startsWith('/seeker-setup')) {
          returnPath = '/client-panel';
        }
        clearStoredRedirect();

        // Refresh state and navigate
        if (typeof checkSeekerProfile === 'function') {
          await checkSeekerProfile();
        }
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }

        setTimeout(() => {
          window.location.href = returnPath;
        }, 400);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="vz-setup-page">
      <div className="vz-setup-container">
        {/* Brand Header */}
        <header className="vz-setup-header">
          <Link to="/" className="vz-setup-brand" aria-label="Return to Vistaraz Home">
            <img src="/logo.png" alt="Vistaraz" height="42" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/client-panel"
              className="vz-setup-signout-btn"
              style={{ textDecoration: 'none', background: 'var(--vz-primary-light, #eef2ff)', color: 'var(--vz-primary, #6366f1)', fontWeight: 600 }}
              title="Skip directly to dashboard"
            >
              Go to Dashboard &rarr;
            </Link>
            <button
              type="button"
              onClick={logout}
              className="vz-setup-signout-btn"
              title="Sign out of current account"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Setup Card */}
        <main className="vz-setup-card">
          <div className="vz-setup-card-intro">
            <div className="vz-setup-badge">
              <Sparkles size={14} className="vz-setup-badge-icon" />
              <span>Step 1 of 1 · Welcome to Sanctuary</span>
            </div>
            <h1 className="vz-setup-title">Set Up Your Seeker Profile</h1>
            <p className="vz-setup-description">
              Let's create your personal profile so you can access support in a way that feels
              comfortable and private.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="vz-setup-banner-error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="vz-setup-banner-success" role="status">
              <CheckCircle2 size={18} />
              <span>Profile created successfully! Entering your sanctuary dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="vz-setup-form">
            {/* Field A: Real Name */}
            <div className="vz-setup-field">
              <label htmlFor="seeker-real-name" className="vz-setup-label">
                Real Name <span className="vz-setup-required" aria-hidden="true">*</span>
              </label>
              <input
                id="seeker-real-name"
                name="realName"
                type="text"
                className={`vz-setup-input ${fieldErrors.realName ? 'vz-setup-input--error' : ''}`}
                placeholder="e.g. Maya Sharma or Jordan Reed"
                value={realName}
                onChange={(e) => {
                  setRealName(e.target.value);
                  if (fieldErrors.realName) {
                    setFieldErrors((prev) => ({ ...prev, realName: null }));
                  }
                }}
                autoComplete="name"
                disabled={loading || success}
                required
              />
              {fieldErrors.realName && (
                <span className="vz-setup-field-error" role="alert">
                  {fieldErrors.realName}
                </span>
              )}
              <span className="vz-setup-field-hint">
                Your real name is stored securely and never shown during anonymous peer sessions.
              </span>
            </div>

            {/* Field B: Choose Your Avatar */}
            <div className="vz-setup-field">
              <div className="vz-setup-label-group">
                <label className="vz-setup-label">
                  Choose Your Avatar <span className="vz-setup-required" aria-hidden="true">*</span>
                </label>
                <span className="vz-setup-avatar-counter">
                  Selected:{' '}
                  <strong>
                    {AVATAR_LIST.find((a) => a.id === selectedAvatarId)?.name || 'Serene Fox'}
                  </strong>
                </span>
              </div>

              <div
                className="vz-avatar-grid"
                role="radiogroup"
                aria-label="Select an illustrated avatar"
              >
                {AVATAR_LIST.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${avatar.name} (${avatar.theme})`}
                      className={`vz-avatar-tile ${isSelected ? 'vz-avatar-tile--selected' : ''}`}
                      onClick={() => {
                        setSelectedAvatarId(avatar.id);
                        if (fieldErrors.avatar) {
                          setFieldErrors((prev) => ({ ...prev, avatar: null }));
                        }
                      }}
                      disabled={loading || success}
                    >
                      <div className="vz-avatar-tile-inner">
                        <AvatarImage avatarId={avatar.id} size={54} alt={avatar.name} />
                        <span className="vz-avatar-tile-name">{avatar.name}</span>
                        {isSelected && (
                          <span className="vz-avatar-tile-check" aria-hidden="true">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {fieldErrors.avatar && (
                <span className="vz-setup-field-error" role="alert">
                  {fieldErrors.avatar}
                </span>
              )}
            </div>

            {/* Privacy Assurance Reassurance Badge */}
            <div className="vz-setup-privacy-box">
              <ShieldCheck size={20} className="vz-setup-shield-icon" />
              <div>
                <strong>Confidentiality by Design</strong>
                <p>
                  No profile photos or personal documents are required. When you connect with a
                  listener, an encrypted session identity is generated to keep your real identity
                  protected.
                </p>
              </div>
            </div>

            {/* CTA: Create My Profile */}
            <button
              type="submit"
              className="vz-setup-submit-btn"
              disabled={loading || success}
              id="create-seeker-profile-btn"
            >
              {loading ? (
                <>
                  <span className="vz-setup-spinner" />
                  <span>Creating your profile...</span>
                </>
              ) : success ? (
                <>
                  <span>Profile Created</span>
                  <CheckCircle2 size={16} />
                </>
              ) : (
                <>
                  <span>Create My Profile</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

