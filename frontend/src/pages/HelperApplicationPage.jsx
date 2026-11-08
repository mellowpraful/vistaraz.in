import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Clock, CheckCircle2, AlertCircle, ArrowRight,
  LogOut, Lock, FileText, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './HelperApplicationPage.css';

/**
 * HelperApplicationPage
 * 
 * Journey destination for users registered with the 'helper' role.
 * Displays verification status, credential collection, and safeguarding agreement.
 * Blocks unverified helpers from accessing the live Listener Portal (/listener-portal).
 */
export default function HelperApplicationPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [qualification, setQualification] = useState('Psychology Student / Intern');
  const [languages, setLanguages] = useState('English, Hindi');
  const [statement, setStatement] = useState('');
  const [agreedCode, setAgreedCode] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isVerified = user?.helperVerificationStatus === 'verified';

  const handleSaveDetails = (e) => {
    e.preventDefault();
    updateUser({
      helperQualification: qualification,
      helperLanguages: languages,
      helperStatement: statement,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="vz-helper-app-page">
      <div className="vz-helper-app-container">
        {/* Navigation */}
        <header className="vz-helper-app-nav">
          <Link to="/" className="vz-helper-app-nav-brand">
            <img src="/logo.png" alt="Vistaraz" />
          </Link>

          <button
            type="button"
            className="vz-helper-app-logout-btn"
            onClick={handleLogout}
            id="helper-logout-btn"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Page Header */}
        <div className="vz-helper-app-header">
          <span className="vz-helper-app-eyebrow">HELPER ONBOARDING JOURNEY</span>
          <h1 className="vz-helper-app-title">
            Helper Application &amp; Verification
          </h1>
          <p className="vz-helper-app-desc">
            Welcome, <strong>{user?.name || 'Aspiring Helper'}</strong>. To safeguard our youth sanctuary, all peer listeners and care providers undergo credential and identity verification.
          </p>
        </div>

        {/* Status Card */}
        <div
          id="helper-verification-status-card"
          className={`vz-helper-status-card ${isVerified ? 'vz-helper-status-card--verified' : 'vz-helper-status-card--pending'}`}
        >
          <div className={`vz-helper-status-badge ${isVerified ? 'vz-helper-status-badge--verified' : 'vz-helper-status-badge--pending'}`}>
            {isVerified ? <CheckCircle2 size={16} /> : <Clock size={16} />}
            <span>{isVerified ? 'Application Verified & Active' : 'Application In Review'}</span>
          </div>

          <h2 className="vz-helper-status-title">
            {isVerified
              ? 'Congratulations! Your Listener Status is Active.'
              : 'Your Credentials are Under Safeguarding Review'}
          </h2>

          <p className="vz-helper-status-desc">
            {isVerified
              ? 'You have completed all verification criteria. You now have full access to the live Listener Portal, incoming peer support queue, and counseling workspace.'
              : 'Our clinical team is reviewing your background and verification details. Unverified helpers cannot access the live queue or initiate sessions with youth.'}
          </p>

          {/* Checklist */}
          <ul className="vz-helper-checklist">
            <li className="vz-helper-check-item vz-helper-check-item--done">
              <CheckCircle2 size={18} />
              <span>1. Account Registration &amp; Email Confirmation (Completed)</span>
            </li>
            <li className={`vz-helper-check-item ${isVerified ? 'vz-helper-check-item--done' : 'vz-helper-check-item--active'}`}>
              {isVerified ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              <span>2. Academic Background &amp; Credential Verification {isVerified ? '(Approved)' : '(Under Review)'}</span>
            </li>
            <li className={`vz-helper-check-item ${isVerified ? 'vz-helper-check-item--done' : 'vz-helper-check-item--locked'}`}>
              {isVerified ? <CheckCircle2 size={18} /> : <Lock size={18} />}
              <span>3. Live Queue Access &amp; Peer Listener Console {isVerified ? '(Unlocked)' : '(Locked until approved)'}</span>
            </li>
          </ul>

          {/* Next Action */}
          {isVerified ? (
            <Link
              to="/listener-portal"
              id="enter-listener-portal-btn"
              className="vz-auth-submit-btn"
              style={{ display: 'inline-flex', width: 'auto', padding: '12px 28px' }}
            >
              <span>Enter Listener Portal</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.9rem' }}>
              <AlertCircle size={16} />
              <span>Estimated review duration: 24 to 48 hours.</span>
            </div>
          )}
        </div>

        {/* Application Details Form */}
        <div className="vz-helper-form-card">
          <h2 className="vz-helper-form-title">Helper Profile Details</h2>

          <form onSubmit={handleSaveDetails}>
            <div className="vz-helper-form-grid">
              <div className="vz-auth-field">
                <label htmlFor="helper-qual" className="vz-auth-label">Background / Role</label>
                <select
                  id="helper-qual"
                  className="vz-auth-input"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                >
                  <option value="Psychology Student / Intern">Psychology Student / Intern</option>
                  <option value="Trained Peer Listener">Trained Peer Listener</option>
                  <option value="Certified Counselor">Certified Counselor</option>
                  <option value="Licensed Psychologist">Licensed Psychologist</option>
                </select>
              </div>

              <div className="vz-auth-field">
                <label htmlFor="helper-lang" className="vz-auth-label">Languages Spoken</label>
                <input
                  type="text"
                  id="helper-lang"
                  className="vz-auth-input"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Hindi, Bengali"
                />
              </div>
            </div>

            <div className="vz-auth-field" style={{ marginBottom: '18px' }}>
              <label htmlFor="helper-statement" className="vz-auth-label">
                Why do you want to support youth on Vistaraz? (Optional)
              </label>
              <textarea
                id="helper-statement"
                className="vz-auth-input"
                rows={3}
                placeholder="Share your motivation and empathetic approach..."
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="vz-auth-terms" style={{ marginBottom: '20px' }}>
              <label className="vz-auth-terms-label">
                <input
                  type="checkbox"
                  className="vz-auth-terms-checkbox"
                  checked={agreedCode}
                  onChange={(e) => setAgreedCode(e.target.checked)}
                />
                <span>
                  I pledge to uphold the Vistaraz Safeguarding Code of Ethics and report active crisis risks immediately.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="vz-auth-submit-btn"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              <span>Save Application Details</span>
            </button>

            {saveSuccess && (
              <span style={{ marginLeft: '14px', color: '#10b981', fontSize: '0.875rem' }}>
                ✓ Application updated successfully
              </span>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
