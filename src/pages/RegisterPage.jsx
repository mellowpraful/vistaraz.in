import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowRight, Check, Eye, EyeOff, User, HeartHandshake } from 'lucide-react';
import './RegisterPage.css';

/**
 * RegisterPage
 * Assigned to: Developer 2
 * Source: register.html
 * Route: /register
 *
 * Dual-onboarding portal for seekers & listeners with role switch, multi-step forms,
 * age gate checkbox, anonymous/private profile toggling, and avatar selection.
 * Auth is mocked — form logic is fully interactive but not connected to a live backend.
 */

const SEEKER_AVATARS = ['🦊', '🦉', '🌿', '🌙', '🌊', '✨'];

const QUALIFICATIONS = [
  'Psychology Student / Intern',
  'Trained Peer Listener',
  'Certified Counselor',
  'Licensed Psychologist',
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();

  // ── Top-level state ──
  const [role, setRole] = useState('seeker'); // 'seeker' | 'provider'
  const [authAction, setAuthAction] = useState('register'); // 'register' | 'login'

  // ── Seeker state ──
  const [seekerProfileType, setSeekerProfileType] = useState('anon');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [seekerNickname, setSeekerNickname] = useState('');
  const [seekerName, setSeekerName] = useState('');
  const [seekerEmail, setSeekerEmail] = useState('');
  const [seekerPassword, setSeekerPassword] = useState('');
  const [seekerShowPw, setSeekerShowPw] = useState(false);
  const [seekerTerms, setSeekerTerms] = useState(false);
  const [seekerError, setSeekerError] = useState('');
  const [seekerSuccess, setSeekerSuccess] = useState('');
  const [seekerLoading, setSeekerLoading] = useState(false);

  // ── Seeker login state ──
  const [seekerLoginEmail, setSeekerLoginEmail] = useState('');
  const [seekerLoginPassword, setSeekerLoginPassword] = useState('');
  const [seekerLoginError, setSeekerLoginError] = useState('');
  const [seekerLoginLoading, setSeekerLoginLoading] = useState(false);

  // ── Provider state ──
  const [providerName, setProviderName] = useState('');
  const [providerQual, setProviderQual] = useState(QUALIFICATIONS[0]);
  const [providerLanguages, setProviderLanguages] = useState('English, Hindi');
  const [providerEmail, setProviderEmail] = useState('');
  const [providerPassword, setProviderPassword] = useState('');
  const [providerShowPw, setProviderShowPw] = useState(false);
  const [providerTerms, setProviderTerms] = useState(false);
  const [providerError, setProviderError] = useState('');
  const [providerSuccess, setProviderSuccess] = useState('');
  const [providerLoading, setProviderLoading] = useState(false);

  // ── Provider login state ──
  const [providerLoginEmail, setProviderLoginEmail] = useState('');
  const [providerLoginPassword, setProviderLoginPassword] = useState('');
  const [providerLoginError, setProviderLoginError] = useState('');
  const [providerLoginLoading, setProviderLoginLoading] = useState(false);

  // ── Parse URL params on mount ──
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const actionParam = searchParams.get('action');
    if (roleParam === 'provider' || roleParam === 'counselor') setRole('provider');
    else if (roleParam === 'seeker') setRole('seeker');
    if (actionParam === 'login') setAuthAction('login');
  }, [searchParams]);

  // ── Seeker register handler ──
  async function handleSeekerRegister(e) {
    e.preventDefault();
    setSeekerError('');
    setSeekerSuccess('');
    if (!seekerTerms) { setSeekerError('Please agree to the Terms & Conditions to continue.'); return; }
    if (!seekerEmail || !seekerPassword) { setSeekerError('Please enter your email and password.'); return; }
    setSeekerLoading(true);
    // Simulated async call (real backend: VistarazAuth.signUp)
    await new Promise((r) => setTimeout(r, 900));
    setSeekerLoading(false);
    setSeekerSuccess('✅ Account created! Check your email for a confirmation link, then sign in.');
  }

  // ── Seeker login handler ──
  async function handleSeekerLogin(e) {
    e.preventDefault();
    setSeekerLoginError('');
    if (!seekerLoginEmail || !seekerLoginPassword) { setSeekerLoginError('Please enter your email and password.'); return; }
    setSeekerLoginLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSeekerLoginLoading(false);
    setSeekerLoginError('Sign-in is handled by the live authentication service. Please ensure the backend is connected.');
  }

  // ── Provider register handler ──
  async function handleProviderRegister(e) {
    e.preventDefault();
    setProviderError('');
    setProviderSuccess('');
    if (!providerTerms) { setProviderError('Please agree to the Terms & Conditions to continue.'); return; }
    if (!providerEmail || !providerPassword || !providerName) { setProviderError('Please fill in all required fields.'); return; }
    setProviderLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setProviderLoading(false);
    setProviderSuccess('✅ Account created! Check your email for a confirmation link, then sign in.');
  }

  // ── Provider login handler ──
  async function handleProviderLogin(e) {
    e.preventDefault();
    setProviderLoginError('');
    if (!providerLoginEmail || !providerLoginPassword) { setProviderLoginError('Please enter your email and password.'); return; }
    setProviderLoginLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setProviderLoginLoading(false);
    setProviderLoginError('Sign-in is handled by the live authentication service. Please ensure the backend is connected.');
  }

  return (
    <AppLayout>
      <div className="reg-page">
        {/* Top Header */}
        <section className="reg-header">
          <span className="reg-eyebrow">CHOOSE YOUR PATHWAY</span>
          <h1 className="reg-header__title">
            Welcome to <em>Vistaraz</em>
          </h1>
          <p className="reg-header__desc">
            Whether you are seeking a safe, confidential space or looking to offer compassionate
            support as a listener, select your pathway below.
          </p>
        </section>

        {/* Role Cards */}
        <div className="reg-role-cards">
          <button
            type="button"
            id="role-seeker-card"
            className={`reg-role-card ${role === 'seeker' ? 'reg-role-card--active' : ''}`}
            onClick={() => setRole('seeker')}
            aria-pressed={role === 'seeker'}
          >
            <div className="reg-role-card__header">
              <div className="reg-role-card__icon reg-role-card__icon--seeker">🌿</div>
              <div>
                <h3 className="reg-role-card__name">I Need Help</h3>
                <span className="reg-role-card__tag reg-role-card__tag--seeker">Youth & Students</span>
              </div>
              {role === 'seeker' && <span className="reg-role-card__check"><Check size={14} /></span>}
            </div>
            <p className="reg-role-card__desc">
              Private emotional support, 2-min check-in, free breathing tools, and 1-on-1 chat/video
              sessions with verified listeners.
            </p>
          </button>

          <button
            type="button"
            id="role-provider-card"
            className={`reg-role-card ${role === 'provider' ? 'reg-role-card--active reg-role-card--provider-active' : ''}`}
            onClick={() => setRole('provider')}
            aria-pressed={role === 'provider'}
          >
            <div className="reg-role-card__header">
              <div className="reg-role-card__icon reg-role-card__icon--provider">🤝</div>
              <div>
                <h3 className="reg-role-card__name">I Want to Help</h3>
                <span className="reg-role-card__tag reg-role-card__tag--provider">Listeners & Counselors</span>
              </div>
              {role === 'provider' && <span className="reg-role-card__check"><Check size={14} /></span>}
            </div>
            <p className="reg-role-card__desc">
              For psychology trainees, students & certified listeners. Manage live incoming queue,
              audio/video sessions, and schedules.
            </p>
          </button>
        </div>

        {/* Auth Mode Toggle */}
        <div className="reg-auth-toggle">
          <div className="reg-auth-toggle__inner">
            <button
              id="auth-tab-register"
              type="button"
              className={`reg-auth-tab ${authAction === 'register' ? 'reg-auth-tab--active' : ''}`}
              onClick={() => setAuthAction('register')}
            >
              Create Account
            </button>
            <button
              id="auth-tab-login"
              type="button"
              className={`reg-auth-tab ${authAction === 'login' ? 'reg-auth-tab--active' : ''}`}
              onClick={() => setAuthAction('login')}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* ── SEEKER FORM CONTAINER ── */}
        {role === 'seeker' && (
          <div id="seeker-auth-container" className="reg-form-card">
            {authAction === 'register' ? (
              /* Seeker Register */
              <div id="seeker-register-box">
                <div className="reg-form-top">
                  <span className="reg-form-eyebrow" style={{ color: 'var(--vz-primary)' }}>SEEKER ONBOARDING</span>
                  <h2 className="reg-form-title">How would you like to appear?</h2>
                  <p className="reg-form-subtitle">Privacy is our core foundation. Choose your comfort level.</p>
                </div>

                {/* Identity Sub-Tabs */}
                <div className="reg-profile-tabs">
                  <button
                    id="tab-anon-btn"
                    type="button"
                    className={`reg-profile-tab ${seekerProfileType === 'anon' ? 'reg-profile-tab--active' : ''}`}
                    onClick={() => setSeekerProfileType('anon')}
                  >
                    <span>🦊</span>
                    <div>
                      <div className="reg-profile-tab__title">Anonymous Profile</div>
                      <div className="reg-profile-tab__sub">Avatar + Nickname</div>
                    </div>
                  </button>
                  <button
                    id="tab-private-btn"
                    type="button"
                    className={`reg-profile-tab ${seekerProfileType === 'private' ? 'reg-profile-tab--active' : ''}`}
                    onClick={() => setSeekerProfileType('private')}
                  >
                    <span>🔒</span>
                    <div>
                      <div className="reg-profile-tab__title">Private Profile</div>
                      <div className="reg-profile-tab__sub">Real Name (Confidential)</div>
                    </div>
                  </button>
                </div>

                <form id="seeker-reg-form" onSubmit={handleSeekerRegister} noValidate>
                  {/* Avatar picker — anonymous only */}
                  {seekerProfileType === 'anon' && (
                    <div id="seeker-anon-fields">
                      <label className="reg-label">Choose an Avatar</label>
                      <div className="reg-avatar-grid" role="group" aria-label="Select avatar">
                        {SEEKER_AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`reg-avatar-item ${selectedAvatar === emoji ? 'reg-avatar-item--selected' : ''}`}
                            onClick={() => setSelectedAvatar(emoji)}
                            aria-pressed={selectedAvatar === emoji}
                            aria-label={`Select avatar ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="reg-field">
                        <label htmlFor="seeker-anon-nickname" className="reg-label">
                          Nickname / Handle
                        </label>
                        <input
                          type="text"
                          id="seeker-anon-nickname"
                          className="reg-input"
                          placeholder="e.g. moonlit_wanderer"
                          value={seekerNickname}
                          onChange={(e) => setSeekerNickname(e.target.value)}
                          autoComplete="nickname"
                        />
                      </div>
                    </div>
                  )}

                  {/* Private Name — private profile only */}
                  {seekerProfileType === 'private' && (
                    <div id="seeker-private-fields">
                      <div className="reg-field">
                        <label htmlFor="seeker-private-name" className="reg-label">Full Name</label>
                        <input
                          type="text"
                          id="seeker-private-name"
                          className="reg-input"
                          placeholder="Your full name"
                          value={seekerName}
                          onChange={(e) => setSeekerName(e.target.value)}
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="reg-field">
                    <label htmlFor="seeker-email" className="reg-label">Email Address</label>
                    <input
                      type="email"
                      id="seeker-email"
                      className="reg-input"
                      required
                      placeholder="you@example.com"
                      value={seekerEmail}
                      onChange={(e) => setSeekerEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div className="reg-field reg-field--last">
                    <label htmlFor="seeker-password" className="reg-label">Create Password</label>
                    <div className="reg-input-pw-wrap">
                      <input
                        type={seekerShowPw ? 'text' : 'password'}
                        id="seeker-password"
                        className="reg-input reg-input--pw"
                        required
                        placeholder="••••••••"
                        value={seekerPassword}
                        onChange={(e) => setSeekerPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="reg-pw-toggle"
                        onClick={() => setSeekerShowPw((v) => !v)}
                        aria-label={seekerShowPw ? 'Hide password' : 'Show password'}
                      >
                        {seekerShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="reg-terms">
                    <label className="reg-terms__label">
                      <input
                        type="checkbox"
                        id="seeker-terms"
                        name="terms"
                        required
                        checked={seekerTerms}
                        onChange={(e) => setSeekerTerms(e.target.checked)}
                        className="reg-terms__checkbox"
                      />
                      <span>
                        I agree to the{' '}
                        <Link to="/rules" className="reg-terms__link" target="_blank" rel="noopener noreferrer">
                          Terms &amp; Conditions
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* Error / Success */}
                  {seekerError && <div id="seeker-error" className="reg-error" role="alert">{seekerError}</div>}
                  {seekerSuccess && <div className="reg-success" role="status">{seekerSuccess}</div>}

                  <button
                    id="seeker-submit-btn"
                    type="submit"
                    className="reg-submit-btn"
                    disabled={seekerLoading}
                  >
                    {seekerLoading ? (
                      <span className="reg-spinner" aria-hidden="true" />
                    ) : (
                      <>Enter Client Portal <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Seeker Login */
              <div id="seeker-login-box">
                <div className="reg-form-top">
                  <span className="reg-form-eyebrow" style={{ color: 'var(--vz-primary)' }}>CLIENT SIGN IN</span>
                  <h2 className="reg-form-title">Welcome back</h2>
                  <p className="reg-form-subtitle">Access your wellbeing dashboard, chat logs, and upcoming appointments.</p>
                </div>

                <form id="seeker-login-form" onSubmit={handleSeekerLogin} noValidate>
                  <div className="reg-field">
                    <label htmlFor="seeker-login-email" className="reg-label">Email Address</label>
                    <input
                      type="email"
                      id="seeker-login-email"
                      className="reg-input"
                      required
                      placeholder="you@example.com"
                      value={seekerLoginEmail}
                      onChange={(e) => setSeekerLoginEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div className="reg-field reg-field--last">
                    <label htmlFor="seeker-login-password" className="reg-label">Password</label>
                    <input
                      type="password"
                      id="seeker-login-password"
                      className="reg-input"
                      required
                      placeholder="••••••••"
                      value={seekerLoginPassword}
                      onChange={(e) => setSeekerLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  {seekerLoginError && <div id="seeker-login-error" className="reg-error" role="alert">{seekerLoginError}</div>}

                  <button
                    id="seeker-login-btn"
                    type="submit"
                    className="reg-submit-btn"
                    disabled={seekerLoginLoading}
                  >
                    {seekerLoginLoading ? <span className="reg-spinner" aria-hidden="true" /> : 'Sign In to Dashboard'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── PROVIDER FORM CONTAINER ── */}
        {role === 'provider' && (
          <div
            id="provider-auth-container"
            className="reg-form-card reg-form-card--provider"
          >
            {authAction === 'register' ? (
              /* Provider Register */
              <div id="provider-register-box">
                <div className="reg-form-top">
                  <span className="reg-form-eyebrow" style={{ color: 'var(--vz-pastel-lavender-icon)' }}>LISTENER ONBOARDING</span>
                  <h2 className="reg-form-title">Join the Support Network</h2>
                  <p className="reg-form-subtitle">Connect with youth, conduct empathetic listening sessions, and manage your schedule.</p>
                </div>

                <form id="provider-reg-form" onSubmit={handleProviderRegister} noValidate>
                  {/* Full Name */}
                  <div className="reg-field">
                    <label htmlFor="provider-name" className="reg-label">Full Name</label>
                    <input
                      type="text"
                      id="provider-name"
                      className="reg-input"
                      required
                      placeholder="e.g. Nidhi Mitchell"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>

                  {/* Qualification + Languages — responsive two-column */}
                  <div className="reg-grid-2">
                    <div className="reg-field">
                      <label htmlFor="provider-qualification" className="reg-label">Role / Background</label>
                      <select
                        id="provider-qualification"
                        className="reg-select"
                        value={providerQual}
                        onChange={(e) => setProviderQual(e.target.value)}
                      >
                        {QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div className="reg-field">
                      <label htmlFor="provider-languages" className="reg-label">Languages</label>
                      <input
                        type="text"
                        id="provider-languages"
                        className="reg-input"
                        placeholder="e.g. English, Hindi"
                        value={providerLanguages}
                        onChange={(e) => setProviderLanguages(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="reg-field">
                    <label htmlFor="provider-email" className="reg-label">Professional / University Email</label>
                    <input
                      type="email"
                      id="provider-email"
                      className="reg-input"
                      required
                      placeholder="counselor@university.edu"
                      value={providerEmail}
                      onChange={(e) => setProviderEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div className="reg-field reg-field--last">
                    <label htmlFor="provider-password" className="reg-label">Password</label>
                    <div className="reg-input-pw-wrap">
                      <input
                        type={providerShowPw ? 'text' : 'password'}
                        id="provider-password"
                        className="reg-input reg-input--pw"
                        required
                        placeholder="••••••••"
                        value={providerPassword}
                        onChange={(e) => setProviderPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="reg-pw-toggle"
                        onClick={() => setProviderShowPw((v) => !v)}
                        aria-label={providerShowPw ? 'Hide password' : 'Show password'}
                      >
                        {providerShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="reg-terms">
                    <label className="reg-terms__label">
                      <input
                        type="checkbox"
                        id="provider-terms"
                        name="terms"
                        required
                        checked={providerTerms}
                        onChange={(e) => setProviderTerms(e.target.checked)}
                        className="reg-terms__checkbox"
                      />
                      <span>
                        I agree to the{' '}
                        <Link to="/rules" className="reg-terms__link" target="_blank" rel="noopener noreferrer">
                          Terms &amp; Conditions
                        </Link>
                      </span>
                    </label>
                  </div>

                  {providerError && <div id="provider-error" className="reg-error" role="alert">{providerError}</div>}
                  {providerSuccess && <div className="reg-success" role="status">{providerSuccess}</div>}

                  <button
                    id="provider-submit-btn"
                    type="submit"
                    className="reg-submit-btn reg-submit-btn--provider"
                    disabled={providerLoading}
                  >
                    {providerLoading ? (
                      <span className="reg-spinner" aria-hidden="true" />
                    ) : (
                      <>Open Listener Portal <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Provider Login */
              <div id="provider-login-box">
                <div className="reg-form-top">
                  <span className="reg-form-eyebrow" style={{ color: 'var(--vz-pastel-lavender-icon)' }}>LISTENER SIGN IN</span>
                  <h2 className="reg-form-title">Provider Workspace</h2>
                  <p className="reg-form-subtitle">Log in to access your live queue, schedule, and pending calls.</p>
                </div>

                <form id="provider-login-form" onSubmit={handleProviderLogin} noValidate>
                  <div className="reg-field">
                    <label htmlFor="provider-login-email" className="reg-label">Email Address</label>
                    <input
                      type="email"
                      id="provider-login-email"
                      className="reg-input"
                      required
                      placeholder="counselor@example.com"
                      value={providerLoginEmail}
                      onChange={(e) => setProviderLoginEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div className="reg-field reg-field--last">
                    <label htmlFor="provider-login-password" className="reg-label">Password</label>
                    <input
                      type="password"
                      id="provider-login-password"
                      className="reg-input"
                      required
                      placeholder="••••••••"
                      value={providerLoginPassword}
                      onChange={(e) => setProviderLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  {providerLoginError && <div id="provider-login-error" className="reg-error" role="alert">{providerLoginError}</div>}

                  <button
                    id="provider-login-btn"
                    type="submit"
                    className="reg-submit-btn reg-submit-btn--provider"
                    disabled={providerLoginLoading}
                  >
                    {providerLoginLoading ? <span className="reg-spinner" aria-hidden="true" /> : 'Open Listener Portal'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
