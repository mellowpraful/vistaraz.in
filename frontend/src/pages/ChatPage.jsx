import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SupportDisclaimerModal from '../components/common/SupportDisclaimerModal';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Shield,
  ShieldAlert,
  ArrowLeft,
  Clock,
  Sparkles,
  Lock,
  Heart,
  Info,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import './ChatPage.css';

/**
 * ChatPage
 * Dedicated full-page Peer Chat Support Space.
 *
 * Professional UI refinement inspired by modern communication platforms (Intercom, Microsoft Teams, Telehealth).
 * In accordance with launch requirements:
 * - Fictional listener "Aanya", simulated replies, and fake online status have been removed.
 * - Displays a clear, professional "Listener Support Coming Soon" state.
 * - Enforces mandatory clinical/emergency disclaimer before viewing the space.
 * - Highlights genuine seeker privacy boundaries: no real name is exposed to peers.
 */
export default function ChatPage() {
  const navigate = useNavigate();
  const { user, seekerProfile } = useAuth();

  // Disclaimer modal state
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Active view tab in side drawer
  const [sideTab, setSideTab] = useState('privacy'); // 'privacy' | 'safety' | 'topics'

  const seekerName = seekerProfile?.realName || user?.seekerProfile?.realName || user?.name || 'Support Seeker';
  const seekerAvatarId = seekerProfile?.avatarId || 'avatar_01';

  return (
    <AppLayout hasSidebar={false} headerVariant="client-dashboard">
      {/* ── Mandatory Disclaimer Modal ── */}
      <SupportDisclaimerModal
        isOpen={!disclaimerAccepted}
        mode="chat"
        hasAcknowledged={hasAcknowledged}
        setHasAcknowledged={setHasAcknowledged}
        onAcknowledge={() => setDisclaimerAccepted(true)}
        onCancel={() => navigate('/client-panel')}
      />

      <div className="vz-chat-shell">
        {/* Top Breadcrumb & Status Bar */}
        <div className="vz-chat-top-bar">
          <div className="vz-chat-top-bar__left">
            <Link to="/client-panel" className="vz-chat-back-link">
              <ArrowLeft size={16} />
              <span>Back to Client Panel</span>
            </Link>
            <span className="vz-chat-divider" aria-hidden="true">/</span>
            <span className="vz-chat-breadcrumb-curr">Peer Chat Sanctuary</span>
          </div>

          <div className="vz-chat-top-bar__right">
            <div className="vz-chat-status-pill vz-chat-status-pill--staging">
              <span className="vz-chat-pulse-dot" />
              <span>Listener Network Preparing</span>
            </div>
            <Link to="/safety" className="vz-chat-crisis-badge" title="Urgent Crisis Resources">
              <ShieldAlert size={14} />
              <span>Crisis Safety (112)</span>
            </Link>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="vz-chat-workspace">
          {/* Central Conversation Stage */}
          <main className="vz-chat-stage">
            {/* Stage Header */}
            <header className="vz-stage-header">
              <div className="vz-stage-header__info">
                <div className="vz-stage-icon-wrap" aria-hidden="true">
                  <MessageSquare size={20} className="vz-stage-icon" />
                </div>
                <div>
                  <h1 className="vz-stage-title">Confidential Peer Support Queue</h1>
                  <p className="vz-stage-subtitle">
                    A judgment-free space to speak with trained, empathetic listeners.
                  </p>
                </div>
              </div>

              <div className="vz-stage-header__meta">
                <div className="vz-meta-tag">
                  <Lock size={12} />
                  <span>256-Bit Encrypted Space</span>
                </div>
              </div>
            </header>

            {/* Conversation Stream (Coming Soon State) */}
            <div className="vz-stage-stream">
              {/* Privacy Notice Banner */}
              <div className="vz-stream-notice">
                <Shield size={14} color="var(--vz-primary)" />
                <span>
                  <strong>Privacy Safeguard:</strong> Your real name (<em>{seekerName}</em>) is strictly shielded. When connected, listeners only see your chosen avatar and a randomized session handle.
                </span>
              </div>

              {/* Central Coming Soon Card */}
              <div className="vz-queue-staging-card">
                <div className="vz-queue-icon-bubble" aria-hidden="true">
                  <Sparkles size={32} />
                </div>

                <span className="vz-chip lavender" style={{ margin: '0 auto 12px' }}>
                  SANCTUARY UPDATE
                </span>

                <h2 className="vz-queue-staging-title">Listener Support Coming Soon</h2>

                <p className="vz-queue-staging-desc">
                  We are actively training and vetting our peer listener community to ensure every conversation is empathetic, respectful, and safe. Live 1-on-1 peer matching is currently in final onboarding and will open shortly.
                </p>

                <div className="vz-queue-guidelines-box">
                  <div className="vz-guideline-item">
                    <CheckCircle2 size={16} className="vz-check-icon" />
                    <span>Free, 100% confidential active listening</span>
                  </div>
                  <div className="vz-guideline-item">
                    <CheckCircle2 size={16} className="vz-check-icon" />
                    <span>No personal identification shared with peers</span>
                  </div>
                  <div className="vz-guideline-item">
                    <CheckCircle2 size={16} className="vz-check-icon" />
                    <span>Safe moderation backed by clinical safety protocols</span>
                  </div>
                </div>

                <div className="vz-queue-actions">
                  <Button
                    to="/assessment"
                    variant="primary"
                    size="md"
                    icon={<Sparkles size={16} />}
                  >
                    Take a 2-Minute Wellbeing Check-in
                  </Button>

                  <Button
                    to="/tools"
                    variant="outline"
                    size="md"
                  >
                    Explore Grounding &amp; Breath Tools
                  </Button>
                </div>
              </div>
            </div>

            {/* Disabled Composer (Transparent about state) */}
            <footer className="vz-stage-composer-bar">
              <div className="vz-composer-disabled-banner">
                <Info size={16} />
                <span>
                  Message composer is paused while listener onboarding is underway. No messages are sent.
                </span>
              </div>
              <div className="vz-composer-mock-input">
                <input
                  type="text"
                  placeholder="Chat input will be enabled once your assigned listener joins..."
                  disabled
                  aria-label="Disabled chat input"
                />
                <button type="button" disabled aria-label="Send disabled">
                  Send
                </button>
              </div>
            </footer>
          </main>

          {/* Right Sidebar: Context, Privacy & Support Guidance */}
          <aside className="vz-chat-sidebar">
            <Card variant="default" padding="md" className="vz-chat-info-card">
              <div className="vz-sidebar-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={sideTab === 'privacy'}
                  className={`vz-sidebar-tab ${sideTab === 'privacy' ? 'active' : ''}`}
                  onClick={() => setSideTab('privacy')}
                >
                  <Shield size={14} />
                  <span>Privacy</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sideTab === 'safety'}
                  className={`vz-sidebar-tab ${sideTab === 'safety' ? 'active' : ''}`}
                  onClick={() => setSideTab('safety')}
                >
                  <ShieldAlert size={14} />
                  <span>Crisis Safety</span>
                </button>
              </div>

              {sideTab === 'privacy' && (
                <div className="vz-sidebar-tab-content">
                  <h3 className="vz-sidebar-heading">Anonymous Care Commitment</h3>
                  <p className="vz-sidebar-text">
                    Vistaraz was engineered from the ground up to protect your peace of mind.
                  </p>
                  <ul className="vz-sidebar-features">
                    <li>
                      <strong>Zero Identity Leakage:</strong> Your email, real name, and phone number are never visible to listeners.
                    </li>
                    <li>
                      <strong>Voluntary Disclosure:</strong> You are never required to share personal background, institution, or workplace.
                    </li>
                    <li>
                      <strong>Right to Exit:</strong> You may leave or terminate a conversation at any moment without penalty.
                    </li>
                  </ul>

                  <div className="vz-identity-preview-box">
                    <span className="vz-identity-label">Your Active Session Persona:</span>
                    <div className="vz-identity-badge">
                      <span className="vz-persona-avatar" aria-hidden="true">🛡️</span>
                      <div>
                        <strong>Confidential Seeker</strong>
                        <small>Real name protected</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sideTab === 'safety' && (
                <div className="vz-sidebar-tab-content">
                  <h3 className="vz-sidebar-heading" style={{ color: '#b91c1c' }}>Emergency Protocols</h3>
                  <p className="vz-sidebar-text">
                    Peer listeners provide empathetic conversations, but cannot substitute for emergency clinical care.
                  </p>

                  <div className="vz-crisis-callout">
                    <strong>National Emergency Helpline:</strong>
                    <div className="vz-crisis-number">112</div>
                    <span>Available 24/7 across India</span>
                  </div>

                  <div className="vz-crisis-callout" style={{ marginTop: '10px' }}>
                    <strong>Tele-MANAS Mental Health Helpline:</strong>
                    <div className="vz-crisis-number">14416</div>
                    <span>Toll-free government mental health support</span>
                  </div>

                  <Button
                    to="/safety"
                    variant="soft"
                    size="sm"
                    fullWidth
                    style={{ marginTop: '14px' }}
                  >
                    View All Crisis Resources
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Grounding Tip Card */}
            <Card variant="lavender" padding="md" className="vz-tip-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Heart size={16} color="var(--vz-primary)" />
                <strong style={{ fontSize: '0.9rem', color: 'var(--vz-primary)' }}>Gentle Reminder</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--vz-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                You don't need to have the perfect words ready. Sometimes just typing out what is heavy is enough to create space.
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
