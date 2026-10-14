import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Heart, Video, MessageSquare, BarChart2, Shield, Settings,
  LogOut, HeartPulse, Sparkles, ChevronRight, RefreshCw,
  ShieldAlert, BookOpen, Mic
} from 'lucide-react';
import './ClientPanelPage.css';

/**
 * ClientPanelPage
 * Assigned to: Developer 2
 * Source: client_panel.html
 * Route: /client-panel
 *
 * Client care management dashboard — mood check-in, session tracking,
 * wellbeing snapshot, care tools, privacy controls, and panic exit.
 */

const MOODS = [
  { key: 'low', emoji: '🌧️', label: 'Low' },
  { key: 'tense', emoji: '🌊', label: 'Tense' },
  { key: 'okay', emoji: '🌿', label: 'Okay' },
  { key: 'good', emoji: '☀️', label: 'Good' },
  { key: 'bright', emoji: '✨', label: 'Bright' },
];

const MOOD_MESSAGES = {
  low: "That's okay. You reached out — that takes courage. 💙",
  tense: "Feeling tense is normal. A breathing tool might help right now.",
  okay: "Okay is a good place to be. Let's keep you supported.",
  good: "Wonderful! Keep nurturing that positive energy.",
  bright: "You're shining today! That energy is worth celebrating. ✨",
};

const WELLBEING_BARS = [
  { label: 'Mood', value: 72, color: '#4f46e5' },
  { label: 'Anxiety', value: 40, color: '#f59e0b' },
  { label: 'Connection', value: 85, color: '#10b981' },
];

const CARE_TOOLS = [
  { icon: '🌬️', label: 'Box Breathing', desc: '4-4-4-4 calming breath cycle', to: '/tools' },
  { icon: '📖', label: 'Sanctuary Journal', desc: 'Private, encrypted thoughts', to: '/tools' },
  { icon: '🎵', label: 'Ambient Soundscapes', desc: 'Calming audio environments', to: '/tools' },
  { icon: '⚡', label: 'Panic SOS', desc: 'Instant grounding guide', to: '/safety' },
];

const NAV_VIEWS = ['Home', 'Sessions', 'Check-in', 'Community', 'Tools', 'Profile'];

export default function ClientPanelPage() {
  const [activeView, setActiveView] = useState('Home');
  const [selectedMood, setSelectedMood] = useState(null);
  const [panicModalOpen, setPanicModalOpen] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [notes, setNotes] = useState('');

  // Panic exit handler
  function handlePanicExit() {
    window.location.replace('/');
  }

  return (
    <AppLayout hasSidebar={false}>
      {/* Panic Modal */}
      {panicModalOpen && (
        <div
          className="cp-panic-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Emergency exit confirmation"
          onClick={(e) => { if (e.target === e.currentTarget) setPanicModalOpen(false); }}
        >
          <div className="cp-panic-box">
            <div className="cp-panic-icon" aria-hidden="true">🚨</div>
            <h2 className="cp-panic-title">Emergency Exit</h2>
            <p className="cp-panic-desc">
              This will immediately redirect you away from Vistaraz. Your session will remain
              safe. If you're in immediate danger, call <strong>112</strong> or{' '}
              <Link to="/safety" className="cp-panic-link">view crisis helplines</Link>.
            </p>
            <div className="cp-panic-actions">
              <button
                type="button"
                className="cp-panic-exit-btn"
                onClick={handlePanicExit}
                aria-label="Leave Vistaraz immediately"
              >
                Leave Now
              </button>
              <button
                type="button"
                className="cp-panic-cancel-btn"
                onClick={() => setPanicModalOpen(false)}
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cp-page">
        {/* Portal-level nav tabs */}
        <nav className="cp-tabs" aria-label="Client panel navigation">
          {NAV_VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              className={`cp-tab ${activeView === v ? 'cp-tab--active' : ''}`}
              onClick={() => setActiveView(v)}
              aria-current={activeView === v ? 'page' : undefined}
            >
              {v}
            </button>
          ))}
          {/* Panic exit button — always visible */}
          <button
            type="button"
            className="cp-panic-btn"
            onClick={() => setPanicModalOpen(true)}
            title="Emergency exit"
            aria-label="Emergency exit"
          >
            🚪 Exit
          </button>
        </nav>

        {/* ── HOME VIEW ── */}
        {activeView === 'Home' && (
          <div className="cp-content">
            {/* Welcome Banner */}
            <div className="cp-welcome-banner">
              <div className="cp-welcome-text">
                <span className="cp-eyebrow">YOUR PRIVATE CARE SPACE</span>
                <h1 className="cp-welcome-title">Welcome back, <em>Friend</em> 👋</h1>
                <p className="cp-welcome-desc">
                  You don't have to carry everything alone. Connect with a listener, run a
                  check-in, or explore your care tools at your own pace.
                </p>
              </div>
              <div className="cp-welcome-actions">
                <button
                  type="button"
                  className="cp-action-primary"
                  onClick={() => setActiveView('Check-in')}
                >
                  <HeartPulse size={15} /> Start Check-in
                </button>
                <Link to="/support" className="cp-action-secondary">
                  <Heart size={15} /> Find Support
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="cp-stats-row">
              {[
                { label: 'Sessions', value: '4', sub: 'Total this month', icon: '📹' },
                { label: 'Check-ins', value: '7', sub: 'Reflections logged', icon: '✅' },
                { label: 'Wellbeing', value: '68%', sub: 'Support Index', icon: '📊' },
                { label: 'Plan', value: 'Free', sub: 'Active Member', icon: '🛡️' },
              ].map((stat) => (
                <div key={stat.label} className="cp-stat-card">
                  <div className="cp-stat-top">
                    <span className="cp-stat-label">{stat.label}</span>
                    <span className="cp-stat-icon">{stat.icon}</span>
                  </div>
                  <p className="cp-stat-value">{stat.value}</p>
                  <p className="cp-stat-sub">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Mood + Sessions */}
            <div className="cp-mid-grid">
              {/* Quick Mood Check */}
              <Card variant="default" padding="md" className="cp-mood-card">
                <div className="cp-card-header">
                  <div>
                    <span className="cp-eyebrow cp-eyebrow--green">RIGHT NOW</span>
                    <h2 className="cp-card-title">How are you feeling?</h2>
                  </div>
                  <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>😊</span>
                </div>
                <p className="cp-card-desc">Choose a word that feels closest. Private — no right answer.</p>
                <div className="cp-mood-grid">
                  {MOODS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`cp-mood-btn ${selectedMood === m.key ? 'cp-mood-btn--selected' : ''}`}
                      onClick={() => setSelectedMood(m.key)}
                      aria-pressed={selectedMood === m.key}
                      aria-label={`Mood: ${m.label}`}
                    >
                      <span className="cp-mood-emoji">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
                {selectedMood && (
                  <p className="cp-mood-message" role="status">{MOOD_MESSAGES[selectedMood]}</p>
                )}
              </Card>

              {/* Upcoming Sessions */}
              <Card variant="default" padding="md" className="cp-sessions-card">
                <div className="cp-card-header">
                  <div>
                    <span className="cp-eyebrow">YOUR SUPPORT</span>
                    <h2 className="cp-card-title">Upcoming sessions</h2>
                  </div>
                  <button type="button" className="cp-view-all" onClick={() => setActiveView('Sessions')}>
                    View all →
                  </button>
                </div>

                <div className="cp-session-row">
                  <div>
                    <strong className="cp-session-name">Peer Listening Session</strong>
                    <span className="cp-session-meta">Tomorrow · 4:00 PM · Video</span>
                  </div>
                  <span className="cp-session-badge cp-session-badge--confirmed">Confirmed</span>
                </div>
                <div className="cp-session-row">
                  <div>
                    <strong className="cp-session-name">Open Chat Support</strong>
                    <span className="cp-session-meta">Available when you're ready</span>
                  </div>
                  <Link to="/chat" className="cp-session-badge cp-session-badge--cta">
                    Open Chat
                  </Link>
                </div>

                <button
                  type="button"
                  className="cp-new-session-btn"
                  onClick={() => setActiveView('Sessions')}
                >
                  + Request a new listener session
                </button>
              </Card>
            </div>

            {/* Wellbeing Snapshot */}
            <Card variant="default" padding="md" className="cp-snapshot-card">
              <div className="cp-snapshot-header">
                <div>
                  <span className="cp-eyebrow">RECENT REFLECTIONS</span>
                  <h2 className="cp-card-title">Your wellbeing snapshot</h2>
                </div>
                <Link to="/assessment" className="cp-update-link">
                  <RefreshCw size={12} /> Update Check-in
                </Link>
              </div>

              <div className="cp-wellbeing-bars">
                {WELLBEING_BARS.map((bar) => (
                  <div key={bar.label} className="cp-wellbeing-bar-item">
                    <div className="cp-wellbeing-bar-top">
                      <span className="cp-wellbeing-bar-label">{bar.label}</span>
                      <span className="cp-wellbeing-bar-val" style={{ color: bar.color }}>{bar.value}%</span>
                    </div>
                    <div className="cp-wbar-bg">
                      <div
                        className="cp-wbar-fill"
                        style={{ width: `${bar.value}%`, background: bar.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Care Tools Quick Access */}
            <div className="cp-tools-section">
              <div className="cp-tools-header">
                <span className="cp-eyebrow">INSTANT ACCESS</span>
                <h2 className="cp-card-title">Your care toolkit</h2>
              </div>
              <div className="cp-tools-grid">
                {CARE_TOOLS.map((tool) => (
                  <Link key={tool.label} to={tool.to} className="cp-tool-card">
                    <span className="cp-tool-icon" aria-hidden="true">{tool.icon}</span>
                    <h4 className="cp-tool-label">{tool.label}</h4>
                    <p className="cp-tool-desc">{tool.desc}</p>
                    <ChevronRight size={14} className="cp-tool-arrow" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SESSIONS VIEW ── */}
        {activeView === 'Sessions' && (
          <div className="cp-content">
            <h2 className="cp-section-title">My Sessions</h2>
            <div className="cp-sessions-list">
              {[
                { name: 'Peer Listening Session', date: 'Tomorrow · 4:00 PM', type: 'Video', status: 'confirmed' },
                { name: 'Chat Support — Aanya', date: 'Last Monday', type: 'Chat', status: 'completed' },
                { name: 'Wellbeing Check-in', date: '2 weeks ago', type: 'Assessment', status: 'completed' },
              ].map((s, i) => (
                <Card key={i} variant="default" padding="md" className="cp-session-list-item">
                  <div className="cp-session-row">
                    <div>
                      <strong className="cp-session-name">{s.name}</strong>
                      <span className="cp-session-meta">{s.date} · {s.type}</span>
                    </div>
                    <div className="cp-session-actions">
                      <span className={`cp-session-badge ${s.status === 'confirmed' ? 'cp-session-badge--confirmed' : 'cp-session-badge--done'}`}>
                        {s.status === 'confirmed' ? 'Confirmed' : 'Completed'}
                      </span>
                      {s.status === 'confirmed' && (
                        <Link to="/video-call" className="cp-join-btn">Join</Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── CHECK-IN VIEW ── */}
        {activeView === 'Check-in' && (
          <div className="cp-content">
            <h2 className="cp-section-title">Mental Health Check-in</h2>
            <Card variant="lavender" padding="lg">
              <p style={{ color: 'var(--vz-text-secondary)', marginBottom: 'var(--vz-space-6)' }}>
                Take the 2-minute check-in to understand your current wellbeing across 10 areas.
                Your results are private and never shared without consent.
              </p>
              <Button to="/assessment" variant="primary" icon={<ChevronRight size={16} />}>
                Start Full Assessment
              </Button>
            </Card>
          </div>
        )}

        {/* ── PROFILE VIEW ── */}
        {activeView === 'Profile' && (
          <div className="cp-content">
            <h2 className="cp-section-title">My Profile & Privacy</h2>
            <Card variant="default" padding="lg" className="cp-profile-card">
              <div className="cp-profile-avatar-row">
                <div className="cp-profile-avatar">🦊</div>
                <div>
                  <h3 className="cp-profile-name">Friend</h3>
                  <span className="cp-profile-plan">Free Sanctuary Member</span>
                </div>
              </div>

              <div className="cp-privacy-toggle">
                <div>
                  <strong>Anonymous Mode</strong>
                  <p style={{ fontSize: '0.84rem', color: 'var(--vz-text-muted)', margin: '3px 0 0' }}>
                    No real names or IP logs are shared with listeners.
                  </p>
                </div>
                <button
                  type="button"
                  className={`cp-toggle-btn ${anonymousMode ? 'cp-toggle-btn--on' : ''}`}
                  onClick={() => setAnonymousMode((v) => !v)}
                  role="switch"
                  aria-checked={anonymousMode}
                  aria-label="Toggle anonymous mode"
                >
                  <span className="cp-toggle-thumb" />
                </button>
              </div>

              <div className="cp-profile-actions">
                <Button to="/plans" variant="outline" size="sm">Upgrade Plan</Button>
                <Button to="/register?action=login&logout=true" variant="ghost" size="sm" icon={<LogOut size={14} />} iconPosition="left">
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Other views (Community, Tools) redirect to actual pages ── */}
        {(activeView === 'Community' || activeView === 'Tools') && (
          <div className="cp-content" style={{ textAlign: 'center', padding: 'var(--vz-space-16)' }}>
            <p style={{ marginBottom: 'var(--vz-space-4)' }}>
              {activeView === 'Community' ? 'Explore peer circles and discussions.' : 'Access your full wellness toolkit.'}
            </p>
            <Button to={activeView === 'Community' ? '/community' : '/tools'} variant="primary">
              Open {activeView}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
