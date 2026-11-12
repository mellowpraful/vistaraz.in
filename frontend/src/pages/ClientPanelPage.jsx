import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { AvatarImage } from '../utils/avatars';
import { resolveAuthRedirect, clearStoredRedirect } from '../utils/redirectHelper';
import * as clientService from '../services/clientService';
import {
  Heart,
  Video,
  MessageSquare,
  Shield,
  LogOut,
  HeartPulse,
  Sparkles,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import './ClientPanelPage.css';

/**
 * ClientPanelPage
 * Route: /client-panel
 *
 * Real, database-connected Client Care Management Portal.
 * Connects to live NeonDB data via Better Auth session:
 * - Live session counts & upcoming schedules from `support_sessions`
 * - Live mood logging persisted in `assessments` table
 * - Real 10-area wellbeing check-in snapshot from `assessments`
 * - Honest, encouraging empty states when no sessions or check-ins exist
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

const CARE_TOOLS = [
  { icon: '🌬️', label: 'Box Breathing', desc: '4-4-4-4 calming breath cycle', to: '/tools' },
  { icon: '📖', label: 'Sanctuary Journal', desc: 'Private, encrypted thoughts', to: '/tools' },
  { icon: '🎵', label: 'Ambient Soundscapes', desc: 'Calming audio environments', to: '/tools' },
  { icon: '⚡', label: 'Panic SOS', desc: 'Instant grounding guide', to: '/safety' },
];

export default function ClientPanelPage() {
  const { user, seekerProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const seekerName = seekerProfile?.realName || user?.seekerProfile?.realName || user?.name || 'Friend';
  const seekerAvatarId = seekerProfile?.avatarId || user?.seekerProfile?.avatarId || 'avatar_01';

  // Forward user to original intended destination (e.g. /community) if returning from auth
  useEffect(() => {
    const intended = resolveAuthRedirect(searchParams);
    if (intended && !intended.startsWith('/client-panel')) {
      clearStoredRedirect();
      navigate(intended, { replace: true });
    }
  }, [searchParams, navigate]);

  // Synchronize dashboard active view with URL search param
  const rawTab = (searchParams.get('tab') || 'overview').toLowerCase();
  const activeView =
    rawTab === 'sessions'
      ? 'Sessions'
      : rawTab === 'check-ins' || rawTab === 'check-in'
      ? 'Check-ins'
      : rawTab === 'profile'
      ? 'Profile'
      : rawTab === 'community'
      ? 'Community'
      : rawTab === 'tools'
      ? 'Tools'
      : 'Overview';

  const setActiveView = (view) => {
    if (view === 'Overview' || view === 'Home') {
      setSearchParams({});
    } else {
      const slug = view.toLowerCase().replace(/\s+/g, '-');
      setSearchParams({ tab: slug });
    }
  };

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panicModalOpen, setPanicModalOpen] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);

  // Live Database Data
  const [stats, setStats] = useState({
    totalCompletedSessions: 0,
    upcomingSessionsCount: 0,
    pendingRequestsCount: 0,
    totalMoodCheckins: 0,
    latestMood: null,
    assessmentCount: 0,
    latestAssessment: null,
    plan: { tier: 'Free', name: 'Free Sanctuary Member', status: 'active' },
  });

  const [sessions, setSessions] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodSuccess, setMoodSuccess] = useState('');

  // Load live data from NeonDB
  const loadClientData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        clientService.getDashboardStats().catch((err) => {
          console.warn('[ClientPanel] Stats fetch error:', err);
          return { success: false, data: null, error: err.message };
        }),
        clientService.getSessions().catch((err) => {
          console.warn('[ClientPanel] Sessions fetch error:', err);
          return { success: false, data: [] };
        }),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
        if (statsRes.data.latestMood?.mood) {
          setSelectedMood(statsRes.data.latestMood.mood);
        }
      }

      if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
        setSessions(sessionsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your sanctuary dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Handle live mood check-in click
  const handleMoodSelect = async (moodKey) => {
    setSelectedMood(moodKey);
    setMoodSaving(true);
    setMoodSuccess('');
    try {
      const res = await clientService.recordMood(moodKey);
      if (res.success) {
        setMoodSuccess('Mood logged to your private sanctuary timeline.');
        // Increment mood count in real time
        setStats((prev) => ({
          ...prev,
          totalMoodCheckins: (prev.totalMoodCheckins || 0) + 1,
          latestMood: res.data,
        }));
        setTimeout(() => setMoodSuccess(''), 3500);
      }
    } catch (err) {
      console.error('[ClientPanel] Failed to save mood:', err);
    } finally {
      setMoodSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  function handlePanicExit() {
    window.location.replace('/');
  }

  // Filter real upcoming sessions (scheduled or active)
  const upcomingSessions = sessions.filter(
    (s) => s.sessionStatus === 'scheduled' || s.sessionStatus === 'active'
  );

  return (
    <AppLayout hasSidebar={false} headerVariant="client-dashboard">
      {/* Panic Modal */}
      {panicModalOpen && (
        <div
          className="cp-panic-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Emergency exit confirmation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanicModalOpen(false);
          }}
        >
          <div className="cp-panic-box">
            <div className="cp-panic-icon" aria-hidden="true">🚨</div>
            <h2 className="cp-panic-title">Emergency Exit</h2>
            <p className="cp-panic-desc">
              This will immediately redirect you away from Vistaraz. Your session will remain safe.
              If you're in immediate danger, call <strong>112</strong> or{' '}
              <Link to="/safety" className="cp-panic-link">
                view crisis helplines
              </Link>.
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
        {/* Care Space Status & Quick Exit Toolbar */}
        <div className="cp-top-bar">
          <div className="cp-top-bar__status">
            <span className="cp-status-dot" aria-hidden="true" />
            <span>Confidential &amp; Encrypted Sanctuary Space</span>
          </div>
          <button
            type="button"
            className="cp-panic-btn"
            onClick={() => setPanicModalOpen(true)}
            title="Emergency exit to safety"
            aria-label="Emergency exit"
          >
            🚪 Emergency Exit
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="cp-alert cp-alert--error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              type="button"
              onClick={loadClientData}
              className="cp-empty-action"
              style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── OVERVIEW (HOME) VIEW ── */}
        {(activeView === 'Overview' || activeView === 'Home') && (
          <div className="cp-content">
            {/* Welcome Banner */}
            <div className="cp-welcome-banner">
              <div className="cp-welcome-text">
                <span className="cp-eyebrow">YOUR PRIVATE CARE SPACE</span>
                <h1 className="cp-welcome-title">
                  Welcome back, <em>{seekerName}</em> 👋
                </h1>
                <p className="cp-welcome-desc">
                  You don't have to carry everything alone. Run a gentle check-in, explore care
                  tools, or connect with a listener when you're ready.
                </p>
              </div>
              <div className="cp-welcome-actions">
                <Link to="/assessment" className="cp-action-primary">
                  <HeartPulse size={15} /> Start Check-in
                </Link>
                <Link to="/support" className="cp-action-secondary">
                  <Heart size={15} /> Find Support
                </Link>
              </div>
            </div>

            {/* Live Stats Row (Backed by NeonDB) */}
            <div className="cp-stats-row">
              {loading ? (
                <>
                  <div className="cp-stat-card cp-skeleton-pulse" style={{ height: '110px' }} />
                  <div className="cp-stat-card cp-skeleton-pulse" style={{ height: '110px' }} />
                  <div className="cp-stat-card cp-skeleton-pulse" style={{ height: '110px' }} />
                  <div className="cp-stat-card cp-skeleton-pulse" style={{ height: '110px' }} />
                </>
              ) : (
                [
                  {
                    label: 'Sessions',
                    value: String(stats.totalCompletedSessions || 0),
                    sub: stats.upcomingSessionsCount > 0 ? `${stats.upcomingSessionsCount} upcoming` : 'Completed sessions',
                    icon: '📹',
                  },
                  {
                    label: 'Check-ins',
                    value: String((stats.totalMoodCheckins || 0) + (stats.assessmentCount || 0)),
                    sub: 'Reflections logged',
                    icon: '✅',
                  },
                  {
                    label: 'Wellbeing',
                    value: stats.latestAssessment ? `${stats.latestAssessment.percentage}%` : '—',
                    sub: stats.latestAssessment?.tierTitle ? stats.latestAssessment.tierTitle.slice(0, 20) + '...' : 'Take 2-min check-in',
                    icon: '📊',
                  },
                  {
                    label: 'Plan',
                    value: stats.plan?.tier || 'Free',
                    sub: 'Active Member',
                    icon: '🛡️',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="cp-stat-card">
                    <div className="cp-stat-top">
                      <span className="cp-stat-label">{stat.label}</span>
                      <span className="cp-stat-icon">{stat.icon}</span>
                    </div>
                    <p className="cp-stat-value">{stat.value}</p>
                    <p className="cp-stat-sub">{stat.sub}</p>
                  </div>
                ))
              )}
            </div>

            {/* Mood + Upcoming Sessions */}
            <div className="cp-mid-grid">
              {/* Quick Mood Check (Database-Persisted) */}
              <Card variant="default" padding="md" className="cp-mood-card">
                <div className="cp-card-header">
                  <div>
                    <span className="cp-eyebrow cp-eyebrow--green">RIGHT NOW</span>
                    <h2 className="cp-card-title">How are you feeling?</h2>
                  </div>
                  <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>
                    {selectedMood ? MOODS.find((m) => m.key === selectedMood)?.emoji : '🌱'}
                  </span>
                </div>
                <p className="cp-card-desc">
                  Choose a word that feels closest. Saved confidentially to your reflection log.
                </p>
                <div className="cp-mood-grid">
                  {MOODS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={`cp-mood-btn ${selectedMood === m.key ? 'cp-mood-btn--selected' : ''}`}
                      onClick={() => handleMoodSelect(m.key)}
                      disabled={moodSaving}
                      aria-pressed={selectedMood === m.key}
                      aria-label={`Mood: ${m.label}`}
                    >
                      <span className="cp-mood-emoji">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>

                {moodSaving && (
                  <span className="cp-mood-saving-indicator">
                    <RefreshCw size={12} className="vz-spin" /> Saving reflection to NeonDB...
                  </span>
                )}

                {selectedMood && !moodSaving && (
                  <p className="cp-mood-message" role="status">
                    {MOOD_MESSAGES[selectedMood]}
                  </p>
                )}
                {moodSuccess && (
                  <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                    ✓ {moodSuccess}
                  </span>
                )}
              </Card>

              {/* Upcoming Sessions (Live Database Records) */}
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

                {upcomingSessions.length === 0 ? (
                  <div className="cp-empty-state">
                    <span className="cp-empty-icon" aria-hidden="true">🕊️</span>
                    <h3 className="cp-empty-title">No upcoming sessions</h3>
                    <p className="cp-empty-desc">
                      You haven't scheduled any support sessions yet. Whenever you need an empathetic ear, peer listeners and counselors are available.
                    </p>
                    <Link to="/support" className="cp-empty-action">
                      Browse Support Listeners
                    </Link>
                  </div>
                ) : (
                  upcomingSessions.slice(0, 2).map((s) => (
                    <div key={s.id} className="cp-session-row">
                      <div>
                        <strong className="cp-session-name">
                          {s.sessionType.charAt(0).toUpperCase() + s.sessionType.slice(1)} Session with {s.helperName}
                        </strong>
                        <span className="cp-session-meta">
                          {s.scheduledFor ? new Date(s.scheduledFor).toLocaleString() : 'Scheduled'}
                        </span>
                      </div>
                      <span className={`cp-session-badge cp-session-badge--${s.sessionStatus === 'active' ? 'cta' : 'confirmed'}`}>
                        {s.sessionStatus === 'active' ? 'Active Now' : 'Confirmed'}
                      </span>
                    </div>
                  ))
                )}
              </Card>
            </div>

            {/* Wellbeing Snapshot (Real Assessment Results from NeonDB) */}
            <Card variant="default" padding="md" className="cp-snapshot-card">
              <div className="cp-snapshot-header">
                <div>
                  <span className="cp-eyebrow">RECENT REFLECTIONS</span>
                  <h2 className="cp-card-title">Your wellbeing snapshot</h2>
                </div>
                <Link to="/assessment" className="cp-update-link">
                  <RefreshCw size={12} /> {stats.latestAssessment ? 'Retake Check-in' : 'Start Check-in'}
                </Link>
              </div>

              {!stats.latestAssessment ? (
                <div className="cp-empty-state">
                  <span className="cp-empty-icon" aria-hidden="true">🌱</span>
                  <h3 className="cp-empty-title">No assessment completed yet</h3>
                  <p className="cp-empty-desc">
                    Take the confidential 2-minute non-diagnostic reflection to receive an authentic visual snapshot across 10 areas of life.
                  </p>
                  <Link to="/assessment" className="cp-empty-action">
                    Take 2-Minute Reflection
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--vz-primary)' }}>
                        {stats.latestAssessment.tierTitle}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--vz-text-muted)', display: 'block' }}>
                        Reflected on {new Date(stats.latestAssessment.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="vz-badge vz-badge--green" style={{ fontSize: '0.85rem' }}>
                      Overall Score: {stats.latestAssessment.percentage}%
                    </span>
                  </div>

                  <div className="cp-wellbeing-bars">
                    {stats.latestAssessment.categoryScores &&
                    Object.keys(stats.latestAssessment.categoryScores).length > 0 ? (
                      Object.entries(stats.latestAssessment.categoryScores).slice(0, 3).map(([area, data]) => {
                        const pct = typeof data === 'object' ? data.percentage : Math.round((Number(data) / 5) * 100);
                        const barColor = pct < 45 ? '#f43f5e' : pct < 70 ? '#f59e0b' : '#10b981';
                        return (
                          <div key={area} className="cp-wellbeing-bar-item">
                            <div className="cp-wellbeing-bar-top">
                              <span className="cp-wellbeing-bar-label">{area}</span>
                              <span className="cp-wellbeing-bar-val" style={{ color: barColor }}>
                                {pct}%
                              </span>
                            </div>
                            <div className="cp-wbar-bg">
                              <div className="cp-wbar-fill" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)' }}>
                        Overall Index: {stats.latestAssessment.percentage}%
                      </p>
                    )}
                  </div>
                </>
              )}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 className="cp-section-title" style={{ margin: 0 }}>My Support Sessions</h2>
              <Link to="/support" className="cp-empty-action">
                Find a Listener
              </Link>
            </div>

            {sessions.length === 0 ? (
              <Card variant="default" padding="lg">
                <div className="cp-empty-state">
                  <span className="cp-empty-icon" aria-hidden="true">💬</span>
                  <h3 className="cp-empty-title">No sessions scheduled yet</h3>
                  <p className="cp-empty-desc">
                    When you book or join a chat or video session with a verified peer listener or licensed professional, it will appear here with full confidentiality.
                  </p>
                  <Link to="/support" className="cp-empty-action">
                    Browse Verified Listeners
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="cp-sessions-list">
                {sessions.map((s) => (
                  <Card key={s.id} variant="default" padding="md" className="cp-session-list-item">
                    <div className="cp-session-row">
                      <div>
                        <strong className="cp-session-name">
                          {s.sessionType.charAt(0).toUpperCase() + s.sessionType.slice(1)} Session with {s.helperName}
                        </strong>
                        <span className="cp-session-meta">
                          {s.scheduledFor ? new Date(s.scheduledFor).toLocaleString() : new Date(s.createdAt).toLocaleDateString()} · {s.sessionType}
                        </span>
                      </div>
                      <div className="cp-session-actions">
                        <span
                          className={`cp-session-badge ${
                            s.sessionStatus === 'completed'
                              ? 'cp-session-badge--done'
                              : s.sessionStatus === 'active'
                              ? 'cp-session-badge--cta'
                              : 'cp-session-badge--confirmed'
                          }`}
                        >
                          {s.sessionStatus}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHECK-INS VIEW ── */}
        {(activeView === 'Check-ins' || activeView === 'Check-in') && (
          <div className="cp-content">
            <h2 className="cp-section-title">Mental Health Check-in</h2>
            <Card variant="lavender" padding="lg">
              <p style={{ color: 'var(--vz-text-secondary)', marginBottom: 'var(--vz-space-6)', lineHeight: 1.6 }}>
                Take the confidential 2-minute check-in to understand your current wellbeing across 10 distinct areas.
                Your responses are non-diagnostic, strictly private, and never shared without your consent.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button to="/assessment" variant="primary" icon={<ChevronRight size={16} />}>
                  {stats.latestAssessment ? 'Retake Full Assessment' : 'Start Full Assessment'}
                </Button>
                {stats.latestAssessment && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>Latest score: {stats.latestAssessment.percentage}% ({stats.latestAssessment.tierTitle})</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── PROFILE VIEW ── */}
        {activeView === 'Profile' && (
          <div className="cp-content">
            <h2 className="cp-section-title">My Profile &amp; Privacy</h2>
            <Card variant="default" padding="lg" className="cp-profile-card">
              <div className="cp-profile-avatar-row">
                <div className="cp-profile-avatar" style={{ background: 'transparent' }}>
                  <AvatarImage avatarId={seekerAvatarId} size={54} alt={seekerName} />
                </div>
                <div>
                  <h3 className="cp-profile-name">{seekerName}</h3>
                  <span className="cp-profile-plan">{stats.plan?.name || 'Free Sanctuary Member'}</span>
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
                <Button to="/plans" variant="outline" size="sm">
                  View Sanctuary Plans
                </Button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="vz-btn vz-btn--ghost vz-btn--sm"
                  id="client-panel-sign-out-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Community & Tools Quick Access fallbacks ── */}
        {(activeView === 'Community' || activeView === 'Tools') && (
          <div className="cp-content" style={{ textAlign: 'center', padding: 'var(--vz-space-16)' }}>
            <p style={{ marginBottom: 'var(--vz-space-4)' }}>
              {activeView === 'Community'
                ? 'Explore moderated peer circles and discussions.'
                : 'Access your full wellness toolkit and grounding studios.'}
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
