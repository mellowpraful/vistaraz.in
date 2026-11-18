import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Sparkles, Users, Clock, AlertTriangle, ShieldCheck, Heart,
  MessageSquare, Video, Phone, Calendar, DollarSign, Settings,
  CheckCircle2, ChevronRight, X, Send, Bell, Star, TrendingUp,
  FileText, BookOpen, AlertCircle, RefreshCw, Sliders, Lock
} from 'lucide-react';
import * as peerSupportService from '../services/peerSupportService';
import './ListenerPortalPage.css';

/**
 * ListenerPortalPage
 * Assigned to: Developer 2
 * Source: listener_portal.html
 * Route: /listener-portal
 *
 * Support Listener & Care Provider Workspace — manage live status, incoming seeker
 * requests queue, active video/audio/chat sessions, community learning hub, earnings,
 * and certified provider profile.
 */

export default function ListenerPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [status, setStatus] = useState('offline');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('active');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [supporterProfile, setSupporterProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState('');
  const [reportReason, setReportReason] = useState('Safety Concern / Crisis Risk');
  const [reportNotes, setReportNotes] = useState('');

  // Live timer for active session
  const [seconds, setSeconds] = useState(872); // 14:32 in seconds
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'seeker', time: '14:28', text: "Hello... thank you for picking up. I'm feeling really overwhelmed with assignments." },
    { sender: 'listener', time: '14:29', text: "Welcome. You're safe here. Take a gentle breath — I'm right here with you. What feels heaviest right now?" },
    { sender: 'seeker', time: '14:31', text: "Just feeling like everyone is moving forward and I'm stuck in place." }
  ]);

  // Channel toggles
  const [channels, setChannels] = useState({
    video: false,
    audio: true,
    chat: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadPortalData() {
    try {
      setLoading(true);
      // 1. Supporter profile
      const prof = await peerSupportService.getMySupporterProfile().catch(err => {
        setProfileError(err.message || 'Supporter profile not found');
        return null;
      });

      if (prof) {
        setSupporterProfile(prof);
        if (prof.availability_status) {
          setStatus(prof.availability_status);
        }
      }

      // 2. Incoming candidate offers
      const offers = await peerSupportService.getMyOffers().catch(() => []);
      setRequests(Array.isArray(offers) ? offers : []);

      // 3. User sessions
      const sessList = await peerSupportService.getMySessions().catch(() => []);
      setSessions(Array.isArray(sessList) ? sessList : []);
    } catch (err) {
      console.error('Error loading supporter portal data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortalData();
    const interval = setInterval(loadPortalData, 12000); // 12s polling for live queue
    return () => clearInterval(interval);
  }, []);

  function formatTime(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  async function handleUpdateStatus(newStatus) {
    setStatusMenuOpen(false);
    try {
      await peerSupportService.updateAvailability({ status: newStatus });
      setStatus(newStatus);
      showToast(`Status updated to ${statusColors[newStatus]?.label || newStatus}.`);
    } catch (err) {
      showToast(err.message || 'Failed to update availability status.');
    }
  }

  async function handleAcceptOffer(offerId) {
    try {
      setActionLoading(true);
      await peerSupportService.acceptOffer(offerId);
      showToast('Offer accepted! Awaiting seeker confirmation.');
      await loadPortalData();
    } catch (err) {
      showToast(err.message || 'Failed to accept offer.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeclineOffer(offerId) {
    try {
      setActionLoading(true);
      await peerSupportService.declineOffer(offerId);
      showToast('Offer declined. Request returned to matching pool.');
      await loadPortalData();
    } catch (err) {
      showToast(err.message || 'Failed to decline offer.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleSendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'listener',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: chatInput.trim()
      }
    ]);
    setChatInput('');
  }

  function handleReportSubmit(e) {
    e.preventDefault();
    showToast(`Safeguarding escalation submitted for ${reportTarget}. Clinical supervisor notified.`);
    setReportModalOpen(false);
    setReportNotes('');
  }

  const statusColors = {
    available: { bg: 'var(--vz-success)', text: '#064e3b', label: 'Available', dot: '#10b981' },
    away: { bg: 'var(--vz-pastel-peach-text)', text: '#7c2d12', label: 'Away', dot: '#f59e0b' },
    offline: { bg: '#64748b', text: '#334155', label: 'Offline', dot: '#94a3b8' }
  };

  const activeSessions = sessions.filter(s => s.session_status === 'active' || s.session_status === 'in_progress');
  const upcomingSessions = sessions.filter(s => s.session_status === 'scheduled');
  const completedSessions = sessions.filter(s => s.session_status === 'completed');
  const cancelledSessions = sessions.filter(s => s.session_status === 'cancelled');

  return (
    <AppLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="lp-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} color="var(--vz-success)" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="lp-container">
        {/* Top Control Bar */}
        <header className="lp-topbar">
          <div className="lp-topbar__info">
            <span className="vz-eyebrow">PROVIDER WORKSPACE · DEPT. OF PEER CARE</span>
            <div className="lp-topbar__title-row">
              <h1 className="lp-title">Support Listener Portal</h1>
              <span className="lp-badge verified">
                <ShieldCheck size={14} /> Verified Listener Trainee
              </span>
            </div>
          </div>

          <div className="lp-topbar__controls">
            {/* Live Availability Dropdown */}
            <div className="lp-status-select-wrap">
              <button
                className="lp-status-btn"
                onClick={() => setStatusMenuOpen(prev => !prev)}
                aria-expanded={statusMenuOpen}
              >
                <span
                  className="lp-status-dot"
                  style={{ backgroundColor: statusColors[status]?.dot || '#10b981' }}
                />
                <span className="lp-status-label">{statusColors[status]?.label || status}</span>
                <span className="lp-status-caret">▾</span>
              </button>

              {statusMenuOpen && (
                <div className="lp-status-menu">
                  <button
                    onClick={() => handleUpdateStatus('available')}
                    className={status === 'available' ? 'active' : ''}
                  >
                    <span className="lp-status-dot" style={{ backgroundColor: '#10b981' }} />
                    <strong>Available</strong> — Ready to take sessions
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('away')}
                    className={status === 'away' ? 'active' : ''}
                  >
                    <span className="lp-status-dot" style={{ backgroundColor: '#f59e0b' }} />
                    <strong>Away</strong> — Taking a mindful pause
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('offline')}
                    className={status === 'offline' ? 'active' : ''}
                  >
                    <span className="lp-status-dot" style={{ backgroundColor: '#94a3b8' }} />
                    <strong>Offline</strong> — Paused from incoming queue
                  </button>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <Button
              variant="outline"
              size="sm"
              icon={<Clock size={14} />}
              onClick={() => setScheduleModalOpen(true)}
            >
              Set Schedule
            </Button>
          </div>
        </header>

        {profileError && (
          <div style={{ margin: '16px 0', padding: '14px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <strong>Peer Listener Account Notice:</strong> {profileError}. (If you are a student or volunteer, please ensure your helper application is approved to receive live sessions).
            </div>
            <Button to="/support" variant="outline" size="sm">Go to Support</Button>
          </div>
        )}

        {/* Workspace Navigation Tabs (7 Views from original HTML) */}
        <nav className="lp-nav-tabs" aria-label="Portal Navigation Tabs">
          <button
            className={`lp-tab-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`lp-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`lp-tab-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests {requests.length > 0 && <span className="lp-tab-badge">{requests.length}</span>}
          </button>
          <button
            className={`lp-tab-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions Hub {activeSessions.length > 0 && <span className="lp-tab-badge">{activeSessions.length}</span>}
          </button>
          <button
            className={`lp-tab-item ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            Community Hub
          </button>
          <button
            className={`lp-tab-item ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
          <button
            className={`lp-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </nav>

        {/* ══════════════════════════════════════════════════════════
             VIEW 1: HOME
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div className="lp-view lp-fade-in">
            {/* Welcome Hero Banner */}
            <div className="lp-hero-card">
              <div className="lp-hero-left">
                <span className="vz-chip mint">
                  <ShieldCheck size={14} /> {supporterProfile?.verification_status === 'verified' ? 'Trainee Verified · Supervised' : (supporterProfile?.verification_status || 'Peer Listener Trainee')}
                </span>
                <h2>Welcome back, <em className="lp-name">{supporterProfile?.display_alias || 'Listener'}</em></h2>
                <p>
                  You are currently{' '}
                  <strong style={{ color: statusColors[status]?.dot || '#10b981' }}>● {statusColors[status]?.label || status}</strong>{' '}
                  to receive supportive requests from peers and students in need.
                </p>
              </div>

              <div className="lp-hero-actions">
                <Button
                  variant="primary"
                  size="md"
                  icon={<MessageSquare size={16} />}
                  onClick={() => setActiveTab('requests')}
                >
                  View Requests ({requests.length})
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  icon={<Clock size={16} />}
                  onClick={() => setScheduleModalOpen(true)}
                >
                  Working Hours
                </Button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="lp-stats-grid">
              <div className="lp-stat-card" onClick={() => setActiveTab('requests')}>
                <div className="lp-stat-icon sky"><MessageSquare size={18} /></div>
                <span className="lp-stat-label">Pending Requests</span>
                <strong className="lp-stat-value">{requests.length} In Queue</strong>
                <span className="lp-stat-link">Review incoming →</span>
              </div>

              <div className="lp-stat-card" onClick={() => { setActiveTab('sessions'); setSessionFilter('active'); }}>
                <div className="lp-stat-icon mint"><Heart size={18} /></div>
                <span className="lp-stat-label">Active Session</span>
                <strong className="lp-stat-value">{activeSessions.length > 0 ? `Active (#${activeSessions[0].id.slice(0, 6)})` : 'None Active'}</strong>
                <span className="lp-stat-link" style={{ color: activeSessions.length > 0 ? 'var(--vz-success)' : 'inherit' }}>
                  {activeSessions.length > 0 ? 'Open Chat →' : 'View Sessions Hub →'}
                </span>
              </div>

              <div className="lp-stat-card" onClick={() => setScheduleModalOpen(true)}>
                <div className="lp-stat-icon peach"><Clock size={18} /></div>
                <span className="lp-stat-label">Max Sessions</span>
                <strong className="lp-stat-value">{supporterProfile?.max_active_sessions || 2} concurrent</strong>
                <span className="lp-stat-link">Configure capacity →</span>
              </div>

              <div className="lp-stat-card" onClick={() => setActiveTab('earnings')}>
                <div className="lp-stat-icon lavender"><DollarSign size={18} /></div>
                <span className="lp-stat-label">Volunteering Level</span>
                <strong className="lp-stat-value">Free Beta Pilot</strong>
                <span className="lp-stat-link">View details →</span>
              </div>
            </div>

            {/* Two Column Grid: Upcoming & Alerts */}
            <div className="lp-grid-two">
              <div className="lp-col-left">
                {/* Upcoming Session Preview */}
                <Card variant="default" padding="lg" className="lp-card-section">
                  <div className="lp-section-header">
                    <div>
                      <h3>Upcoming Session Preview</h3>
                      <p className="lp-subtext">Scheduled peer tele-support consultations</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setActiveTab('sessions'); setSessionFilter('upcoming'); }}
                    >
                      All Sessions →
                    </Button>
                  </div>

                  {upcomingSessions.length > 0 ? (
                    <div className="lp-session-item">
                      <div className="lp-session-avatar">👤</div>
                      <div className="lp-session-details">
                        <div className="lp-session-title">
                          <strong>Seeker #{upcomingSessions[0].id.slice(0, 8)}</strong>
                          <span className="vz-chip sky">{upcomingSessions[0].session_type === 'scheduled_voice' ? 'Scheduled Voice' : 'Text Support'}</span>
                        </div>
                        <p className="lp-session-topic">Assigned Peer Support Consultation</p>
                        <span className="lp-session-time">
                          <Clock size={12} /> {upcomingSessions[0].scheduled_for ? new Date(upcomingSessions[0].scheduled_for).toLocaleString() : 'Scheduled'}
                        </span>
                      </div>
                      <div className="lp-session-btn-group">
                        <Button
                          onClick={() => navigate(`/chat?session=${upcomingSessions[0].id}`)}
                          variant="primary"
                          size="sm"
                          icon={<MessageSquare size={14} />}
                        >
                          Open Room
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="lp-empty-state" style={{ padding: '24px 0' }}>
                      <p style={{ color: 'var(--vz-text-secondary)', margin: 0 }}>No upcoming scheduled consultations.</p>
                    </div>
                  )}
                </Card>

                {/* Pending Requests Preview */}
                <Card variant="default" padding="lg" className="lp-card-section">
                  <div className="lp-section-header">
                    <div>
                      <h3>Pending Requests</h3>
                      <p className="lp-subtext">{requests.length} students currently waiting for intake</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('requests')}
                    >
                      Queue Page →
                    </Button>
                  </div>

                  {requests.length === 0 ? (
                    <div className="lp-empty-state">
                      <CheckCircle2 size={32} color="var(--vz-success)" />
                      <p>Queue is all clear. You have answered all incoming requests!</p>
                    </div>
                  ) : (
                    <div className="lp-req-list">
                      {requests.slice(0, 3).map(req => {
                        const offerId = req.candidate_id || req.request_id || req.id;
                        const isAccepted = req.offer_status === 'listener_accepted';
                        return (
                          <div key={offerId} className="lp-req-row">
                            <div>
                              <div className="lp-req-header">
                                <strong>Seeker (Confidential)</strong>
                                <span className="vz-chip lavender">
                                  {req.communication_mode === 'scheduled_voice' ? 'Scheduled Voice' : 'Text Support'}
                                </span>
                              </div>
                              <p className="lp-req-topic">
                                {req.support_category ? req.support_category.replace(/_/g, ' ') : 'General Support'}
                              </p>
                              <span className="lp-req-meta">
                                Lang: {req.preferred_language?.toUpperCase() || 'EN'} · Age: {req.age_band || '18-25'}
                              </span>
                            </div>
                            <div className="lp-req-actions">
                              {!isAccepted ? (
                                <>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={actionLoading}
                                    onClick={() => handleAcceptOffer(offerId)}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={actionLoading}
                                    onClick={() => handleDeclineOffer(offerId)}
                                  >
                                    Pass
                                  </Button>
                                </>
                              ) : (
                                <span className="vz-chip mint">Awaiting Seeker</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              {/* Real-time Alerts Feed */}
              <div className="lp-col-right">
                <Card variant="default" padding="lg" className="lp-card-section">
                  <div className="lp-section-header">
                    <h3>
                      <Bell size={16} /> Real-Time Notifications
                    </h3>
                    <span className="lp-subtext">Live feed</span>
                  </div>

                  <div className="lp-notif-feed">
                    <div className="lp-notif-item">
                      <div className="lp-notif-top">
                        <span className="lp-notif-type success">New Request</span>
                        <span className="lp-notif-time">10 mins ago</span>
                      </div>
                      <p>New student matched for 11:00 PM video consultation.</p>
                    </div>

                    <div className="lp-notif-item">
                      <div className="lp-notif-top">
                        <span className="lp-notif-type accent">Feedback Received</span>
                        <span className="lp-notif-time">2 hours ago</span>
                      </div>
                      <p>Anonymous_1155 rated your session 5.0 ★ ("Extremely kind listener, felt heard for first time").</p>
                    </div>

                    <div className="lp-notif-item">
                      <div className="lp-notif-top">
                        <span className="lp-notif-type purple">Payout Processed</span>
                        <span className="lp-notif-time">Yesterday</span>
                      </div>
                      <p>₹ 340.00 transferred to linked HDFC Bank deposit account.</p>
                    </div>

                    <div className="lp-notif-item">
                      <div className="lp-notif-top">
                        <span className="lp-notif-type warning">Protocol Update</span>
                        <span className="lp-notif-time">2 days ago</span>
                      </div>
                      <p>New active de-escalation guidelines posted in Community Hub.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
             VIEW 2: DASHBOARD
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="lp-view lp-fade-in">
            {/* Header with Quick Availability Switch */}
            <div className="lp-dash-header">
              <div>
                <h2>Provider Performance & Availability</h2>
                <p>Monitor key care metrics, patient satisfaction, and channel settings.</p>
              </div>

              <div className="lp-dash-status-toggles">
                <button
                  className={`lp-dash-toggle-btn ${status === 'available' ? 'active-avail' : ''}`}
                  onClick={() => { setStatus('available'); showToast('Status set to Available.'); }}
                >
                  🟢 Available
                </button>
                <button
                  className={`lp-dash-toggle-btn ${status === 'away' ? 'active-away' : ''}`}
                  onClick={() => { setStatus('away'); showToast('Status set to Away.'); }}
                >
                  🟡 Away
                </button>
                <button
                  className={`lp-dash-toggle-btn ${status === 'offline' ? 'active-off' : ''}`}
                  onClick={() => { setStatus('offline'); showToast('Status set to Offline.'); }}
                >
                  ⚫ Offline
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="lp-metrics-row">
              <Card variant="sky" padding="md" className="lp-metric-card">
                <span className="lp-metric-label">Total Sessions Completed</span>
                <strong className="lp-metric-number">148</strong>
                <span className="lp-metric-trend">
                  <TrendingUp size={13} /> +12 sessions this week
                </span>
              </Card>

              <Card variant="mint" padding="md" className="lp-metric-card">
                <span className="lp-metric-label">Average Listener Rating</span>
                <strong className="lp-metric-number">4.9 / 5.0</strong>
                <span className="lp-metric-sub">Based on 148 verified client reviews</span>
              </Card>

              <Card variant="peach" padding="md" className="lp-metric-card">
                <span className="lp-metric-label">Rapid Response Rate</span>
                <strong className="lp-metric-number">96%</strong>
                <span className="lp-metric-sub">&lt; 2 min average acceptance</span>
              </Card>

              <Card variant="lavender" padding="md" className="lp-metric-card">
                <span className="lp-metric-label">Total Care Hours</span>
                <strong className="lp-metric-number">16.5 Hrs</strong>
                <span className="lp-metric-sub">34 min average duration</span>
              </Card>
            </div>

            {/* Earnings Snapshot & Channel Preferences */}
            <div className="lp-grid-two">
              <Card variant="default" padding="lg">
                <h3>Support Channel Availability</h3>
                <p className="lp-subtext">Choose which modalities you are currently accepting requests for:</p>

                <div className="lp-channel-list">
                  <label className="lp-channel-item">
                    <div className="lp-channel-info">
                      <Video size={18} color="var(--vz-primary)" />
                      <div>
                        <strong>Video Calls</strong>
                        <p>1-on-1 HD secure video tele-support</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.video}
                      onChange={e => setChannels(prev => ({ ...prev, video: e.target.checked }))}
                    />
                  </label>

                  <label className="lp-channel-item">
                    <div className="lp-channel-info">
                      <Phone size={18} color="var(--vz-success)" />
                      <div>
                        <strong>Audio Calls</strong>
                        <p>Voice-only peer counseling and crisis relief</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.audio}
                      onChange={e => setChannels(prev => ({ ...prev, audio: e.target.checked }))}
                    />
                  </label>

                  <label className="lp-channel-item">
                    <div className="lp-channel-info">
                      <MessageSquare size={18} color="var(--vz-pastel-peach-text)" />
                      <div>
                        <strong>Chat Messaging</strong>
                        <p>Real-time encrypted text discussions</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.chat}
                      onChange={e => setChannels(prev => ({ ...prev, chat: e.target.checked }))}
                    />
                  </label>
                </div>
              </Card>

              {/* Student Satisfaction Scores */}
              <Card variant="default" padding="lg">
                <h3>Client Satisfaction &amp; Empathy Score</h3>
                <p className="lp-subtext">Post-session reflections from students supported:</p>

                <div className="lp-score-bars">
                  <div className="lp-score-bar-row">
                    <div className="lp-score-bar-head">
                      <span>5 Stars (Empathy & Listening)</span>
                      <strong>92%</strong>
                    </div>
                    <div className="lp-score-bar-bg">
                      <div className="lp-score-bar-fill" style={{ width: '92%', backgroundColor: 'var(--vz-success)' }} />
                    </div>
                  </div>

                  <div className="lp-score-bar-row">
                    <div className="lp-score-bar-head">
                      <span>4 Stars (Good Session)</span>
                      <strong>6%</strong>
                    </div>
                    <div className="lp-score-bar-bg">
                      <div className="lp-score-bar-fill" style={{ width: '6%', backgroundColor: 'var(--vz-primary)' }} />
                    </div>
                  </div>

                  <div className="lp-score-bar-row">
                    <div className="lp-score-bar-head">
                      <span>3 Stars or below</span>
                      <strong>2%</strong>
                    </div>
                    <div className="lp-score-bar-bg">
                      <div className="lp-score-bar-fill" style={{ width: '2%', backgroundColor: '#f59e0b' }} />
                    </div>
                  </div>
                </div>

                <div className="lp-top-tier-banner">
                  <Star size={16} color="#f59e0b" />
                  <span>Your rating places you in the <strong>Top 5%</strong> of peer listeners this month!</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
             VIEW 3: REQUESTS
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'requests' && (
          <div className="lp-view lp-fade-in">
            <div className="lp-requests-layout">
              {/* Sidebar with Schedule */}
              <aside className="lp-req-sidebar">
                <Card variant="default" padding="md">
                  <div className="lp-sidebar-header">
                    <h4>My Schedule</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScheduleModalOpen(true)}
                    >
                      Edit
                    </Button>
                  </div>

                  <ul className="lp-schedule-list">
                    <li>
                      <span className="label">Active Days</span>
                      <strong className="val">Mon – Fri</strong>
                    </li>
                    <li>
                      <span className="label">Matching Hours</span>
                      <strong className="val">10:00 AM – 6:00 PM</strong>
                    </li>
                    <li>
                      <span className="label">Session Type</span>
                      <strong className="val">Video · Audio · Chat</strong>
                    </li>
                    <li>
                      <span className="label">Daily Max</span>
                      <strong className="val">6 sessions / day</strong>
                    </li>
                    <li>
                      <span className="label">Timezone</span>
                      <strong className="val">IST (UTC+5:30)</strong>
                    </li>
                  </ul>

                  <div className="lp-day-grid">
                    <span className="day-box on">M</span>
                    <span className="day-box on">T</span>
                    <span className="day-box on">W</span>
                    <span className="day-box on">T</span>
                    <span className="day-box on">F</span>
                    <span className="day-box off">S</span>
                    <span className="day-box off">S</span>
                  </div>
                </Card>

                <Card variant="default" padding="md" style={{ marginTop: '16px' }}>
                  <h4>Today's Stats</h4>
                  <ul className="lp-schedule-list">
                    <li>
                      <span className="label">Accepted Today</span>
                      <strong className="val">3</strong>
                    </li>
                    <li>
                      <span className="label">Declined / Passed</span>
                      <strong className="val">0</strong>
                    </li>
                    <li>
                      <span className="label">Supervision Escalations</span>
                      <strong className="val">0</strong>
                    </li>
                  </ul>
                </Card>
              </aside>

              {/* Main Requests Queue List */}
              <div className="lp-req-main">
                <div className="lp-req-header-row">
                  <div>
                    <h2>Live Incoming Intake Queue</h2>
                    <p>Verified seekers seeking guidance. Accept to begin or reassign to pool.</p>
                  </div>
                  <span className="vz-chip mint">
                    ● Queue Live & Polling
                  </span>
                </div>

                {requests.length === 0 ? (
                  <Card variant="default" padding="xl" className="lp-empty-card">
                    <CheckCircle2 size={44} color="var(--vz-success)" />
                    <h3>Intake Queue Empty</h3>
                    <p>There are no pending requests waiting for your profile right now. We will notify you when a match occurs.</p>
                  </Card>
                ) : (
                  <div className="lp-req-cards-grid">
                    {requests.map(req => {
                      const offerId = req.candidate_id || req.request_id || req.id;
                      const isAccepted = req.offer_status === 'listener_accepted';
                      return (
                        <Card key={offerId} variant="default" padding="lg" className="lp-card-item">
                          <div className="lp-card-item-top">
                            <div>
                              <span className="lp-seeker-code">Seeker (Confidential)</span>
                              <span className="vz-chip lavender" style={{ marginLeft: '8px' }}>
                                {req.communication_mode === 'scheduled_voice' ? 'Scheduled Voice' : 'Text Support'}
                              </span>
                            </div>
                            <span className={`lp-urgency-badge ${(req.urgency || 'low').toLowerCase()}`}>
                              {req.urgency || 'Normal'} Urgency
                            </span>
                          </div>

                          <div className="lp-card-item-body">
                            <p className="lp-req-desc">
                              <strong>Primary Focus:</strong> {req.support_category ? req.support_category.replace(/_/g, ' ') : 'General Support'}
                            </p>
                            <div className="lp-req-chips">
                              <span className="lp-chip"><Clock size={12} /> Lang: {req.preferred_language?.toUpperCase() || 'EN'}</span>
                              {req.match_score && <span className="lp-chip mint">Match: {Math.round(req.match_score * 100)}%</span>}
                              <span className="lp-chip">Age Band: {req.age_band || '18-25'}</span>
                            </div>
                            {isAccepted && (
                              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                <strong style={{ color: '#065f46', fontSize: '0.88rem' }}>✓ You accepted this offer!</strong>
                                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#047857' }}>
                                  Waiting for seeker to confirm your profile. Once confirmed, your session will begin in the Sessions Hub.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="lp-card-item-footer">
                            {!isAccepted ? (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleAcceptOffer(offerId)}
                                >
                                  Accept Offer
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleDeclineOffer(offerId)}
                                >
                                  Decline / Next Provider
                                </Button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                                Awaiting Seeker Confirmation...
                              </span>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
             VIEW 4: SESSIONS HUB
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div className="lp-view lp-fade-in">
            <div className="lp-sessions-top">
              <div>
                <h2>Sessions Hub</h2>
                <p>Manage active conversations, consult history, and coordinate ongoing care.</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="lp-filter-pill-group">
                <button
                  className={`lp-pill ${sessionFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setSessionFilter('active')}
                >
                  Active ({activeSessions.length})
                </button>
                <button
                  className={`lp-pill ${sessionFilter === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setSessionFilter('upcoming')}
                >
                  Upcoming ({upcomingSessions.length})
                </button>
                <button
                  className={`lp-pill ${sessionFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setSessionFilter('completed')}
                >
                  Completed ({completedSessions.length})
                </button>
                <button
                  className={`lp-pill ${sessionFilter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setSessionFilter('cancelled')}
                >
                  Cancelled ({cancelledSessions.length})
                </button>
              </div>
            </div>

            {/* Tab: ACTIVE SESSION */}
            {sessionFilter === 'active' && (
              <div className="lp-active-session-wrap">
                {activeSessions.length === 0 ? (
                  <Card variant="default" padding="xl" className="lp-empty-card">
                    <CheckCircle2 size={36} color="var(--vz-text-secondary)" />
                    <h3>No Active Sessions Right Now</h3>
                    <p>When a seeker confirms an accepted match, your active session will appear here.</p>
                  </Card>
                ) : (
                  activeSessions.map(session => (
                    <Card key={session.id} variant="mint" padding="lg" className="lp-active-card" style={{ marginBottom: '16px' }}>
                      <div className="lp-active-header">
                        <div className="lp-active-user">
                          <div className="lp-active-avatar">👤</div>
                          <div>
                            <div className="lp-active-id-row">
                              <h3>Seeker #{session.id.slice(0, 8)}</h3>
                              <span className="vz-chip mint">● In Session</span>
                            </div>
                            <p className="lp-active-topic">
                              Mode: {session.session_type === 'scheduled_voice' ? 'Scheduled Voice Consultation' : 'Text Support Session'}
                            </p>
                          </div>
                        </div>

                        <div className="lp-active-rate">
                          <span className="lp-rate-title">Free Peer Support Pilot</span>
                          <span className="lp-rate-sub">{session.message_count || 0} messages exchanged</span>
                        </div>
                      </div>

                      <div className="lp-active-actions-bar">
                        <div className="lp-active-timer">
                          <Clock size={16} color="var(--vz-primary)" />
                          <span>Status: <strong className="lp-timer-num">{session.session_status}</strong></span>
                        </div>

                        <div className="lp-active-btn-row">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<MessageSquare size={14} />}
                            onClick={() => navigate(`/chat?session=${session.id}`)}
                          >
                            Open Session Chat
                          </Button>
                          {session.session_type === 'scheduled_voice' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Phone size={14} />}
                              onClick={() => navigate(`/chat?session=${session.id}`)}
                            >
                              Join Voice Room
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<AlertTriangle size={14} />}
                            onClick={() => { setReportTarget(`Seeker #${session.id.slice(0, 8)}`); setReportModalOpen(true); }}
                          >
                            Escalate / Report
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tab: UPCOMING */}
            {sessionFilter === 'upcoming' && (
              <div className="lp-sessions-list">
                {upcomingSessions.length === 0 ? (
                  <Card variant="default" padding="xl" className="lp-empty-card">
                    <Clock size={36} color="var(--vz-text-secondary)" />
                    <h3>No Upcoming Scheduled Sessions</h3>
                    <p>Confirmed future consultations and scheduled calls will appear here.</p>
                  </Card>
                ) : (
                  upcomingSessions.map(session => (
                    <Card key={session.id} variant="default" padding="md" className="lp-session-row">
                      <div>
                        <span className="lp-sess-id">Seeker #{session.id.slice(0, 8)}</span>
                        <p className="lp-sess-details">
                          {session.scheduled_for ? new Date(session.scheduled_for).toLocaleString() : 'Scheduled'} · {session.session_type === 'scheduled_voice' ? 'Voice Consultation' : 'Text Support'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="vz-chip lavender">Scheduled</span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/chat?session=${session.id}`)}
                        >
                          Open Waiting Room
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tab: COMPLETED */}
            {sessionFilter === 'completed' && (
              <div className="lp-sessions-list">
                {completedSessions.length === 0 ? (
                  <Card variant="default" padding="xl" className="lp-empty-card">
                    <CheckCircle2 size={36} color="var(--vz-text-secondary)" />
                    <h3>No Completed Sessions Yet</h3>
                    <p>Completed support consultations will appear here once ended.</p>
                  </Card>
                ) : (
                  completedSessions.map(session => (
                    <Card key={session.id} variant="default" padding="md" className="lp-session-row">
                      <div>
                        <span className="lp-sess-id">Session #{session.id.slice(0, 8)}</span>
                        <p className="lp-sess-details">
                          Ended {session.ended_at ? new Date(session.ended_at).toLocaleDateString() : 'Recently'} · {session.message_count || 0} messages
                        </p>
                      </div>
                      <span className="vz-chip mint">Completed</span>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tab: CANCELLED */}
            {sessionFilter === 'cancelled' && (
              <div className="lp-sessions-list">
                {cancelledSessions.length === 0 ? (
                  <Card variant="default" padding="xl" className="lp-empty-card">
                    <CheckCircle2 size={36} color="var(--vz-text-secondary)" />
                    <h3>No Cancelled Sessions</h3>
                  </Card>
                ) : (
                  cancelledSessions.map(session => (
                    <Card key={session.id} variant="default" padding="md" className="lp-session-row">
                      <div>
                        <span className="lp-sess-id">Session #{session.id.slice(0, 8)}</span>
                        <p className="lp-sess-details">Cancelled</p>
                      </div>
                      <span className="vz-chip peach">Cancelled</span>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
             VIEW 5: COMMUNITY
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'community' && (
          <div className="lp-view lp-fade-in">
            {/* Community Banner */}
            <div className="lp-comm-banner">
              <div>
                <span className="vz-eyebrow">SUPPORT LISTENER FORUM</span>
                <h2>Peer Listener Community &amp; Learning Hub</h2>
                <p>Share anonymized care insights, grounding techniques, and de-escalation protocols.</p>
              </div>
              <div className="lp-comm-policy">
                <Lock size={16} color="var(--vz-primary)" />
                <span><strong>Zero PII Policy:</strong> No personal student identifiers are permitted.</span>
              </div>
            </div>

            <div className="lp-grid-two">
              {/* Discussions */}
              <div className="lp-discussions-col">
                <h3>Peer Discussions &amp; De-escalation Topics</h3>

                <Card variant="default" padding="md" className="lp-post-card">
                  <div className="lp-post-meta">
                    <span className="vz-chip sky">Techniques</span>
                    <span>Posted by PeerListener_Mark · 3 hours ago</span>
                  </div>
                  <h4>Grounding exercises for late-night exam panic attacks?</h4>
                  <p>What 5-4-3-2-1 sensory methods work best when chatting with an anxious student late at night?</p>
                  <span className="lp-post-replies"><MessageSquare size={13} /> 24 Replies from verified listeners</span>
                </Card>

                <Card variant="default" padding="md" className="lp-post-card">
                  <div className="lp-post-meta">
                    <span className="vz-chip lavender">Self-Care</span>
                    <span>Posted by Trainee_Elena · Yesterday</span>
                  </div>
                  <h4>Maintaining emotional boundaries after intense listening sessions</h4>
                  <p>Sharing tips on resetting your own mental space after supporting students through grief or heavy anxiety.</p>
                  <span className="lp-post-replies"><MessageSquare size={13} /> 18 Replies from verified listeners</span>
                </Card>

                <Card variant="peach" padding="md">
                  <h4>Anonymous Case-Learning Scenario #402</h4>
                  <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
                    <strong>De-identifying social anxiety triggers in college freshmen:</strong> Analysis of subtle non-verbal cues during text chat support.
                  </p>
                </Card>
              </div>

              {/* Training Resources */}
              <div className="lp-training-col">
                <h3>Training &amp; Clinical Supervision</h3>

                <Card variant="default" padding="md" className="lp-train-card">
                  <div className="lp-train-item">
                    <BookOpen size={20} color="var(--vz-primary)" />
                    <div>
                      <strong>Active Listening Handbook (PDF)</strong>
                      <p>Core empathic reflection &amp; non-judgment guidelines.</p>
                    </div>
                  </div>
                </Card>

                <Card variant="default" padding="md" className="lp-train-card">
                  <div className="lp-train-item">
                    <ShieldCheck size={20} color="var(--vz-success)" />
                    <div>
                      <strong>Crisis Referral &amp; Escalation Protocols</strong>
                      <p>Clear criteria for when to transfer a session to licensed clinical psychologists.</p>
                    </div>
                  </div>
                </Card>

                <Card variant="sky" padding="md">
                  <h4>Monthly Peer Supervision Q&amp;A</h4>
                  <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
                    Join Clinical Advisor Dr. Verma on Thursday at 7:00 PM IST on secure tele-link.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
             VIEW 6: EARNINGS
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'earnings' && (
          <div className="lp-view lp-fade-in">
            <div className="lp-earnings-header">
              <div>
                <h2>Earnings &amp; Honorarium Overview</h2>
                <p>Transparent accounting for peer support hours and direct bank transfers.</p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => showToast('Instant payout request queued for bank transfer.')}
              >
                Request Instant Payout
              </Button>
            </div>

            <div className="lp-stats-grid">
              <Card variant="sky" padding="md">
                <span className="lp-stat-label">Today's Total</span>
                <strong className="lp-stat-value">₹ 120.00</strong>
                <span className="lp-subtext">3 completed sessions</span>
              </Card>

              <Card variant="mint" padding="md">
                <span className="lp-stat-label">This Week</span>
                <strong className="lp-stat-value">₹ 350.00</strong>
                <span className="lp-subtext">11 sessions total</span>
              </Card>

              <Card variant="peach" padding="md">
                <span className="lp-stat-label">This Month</span>
                <strong className="lp-stat-value">₹ 1,350.00</strong>
                <span className="lp-subtext">August 2026 cycle</span>
              </Card>

              <Card variant="lavender" padding="md">
                <span className="lp-stat-label">Lifetime Earned</span>
                <strong className="lp-stat-value">₹ 4,820.00</strong>
                <span className="lp-subtext">148 sessions credited</span>
              </Card>
            </div>

            <Card variant="default" padding="lg" style={{ marginTop: '24px' }}>
              <div className="lp-payout-box">
                <div>
                  <span className="lp-stat-label">Available Balance for Transfer</span>
                  <strong className="lp-balance-num">₹ 340.00</strong>
                  <p className="lp-subtext">Verified & ready to withdraw</p>
                </div>
                <div>
                  <span className="lp-stat-label">Pending Processing</span>
                  <strong className="lp-balance-num" style={{ color: '#f59e0b' }}>₹ 110.00</strong>
                  <p className="lp-subtext">Clears within 24 hours</p>
                </div>
                <div className="lp-bank-card">
                  <span className="lp-bank-title">Payout Method</span>
                  <strong>HDFC Bank Direct Deposit ****4821</strong>
                  <span className="lp-subtext">Next regular cycle: Friday, Aug 22, 2026</span>
                </div>
              </div>
            </Card>

            {/* Earnings History Table */}
            <Card variant="default" padding="lg" style={{ marginTop: '24px' }}>
              <h3>Recent Session Credits</h3>
              <div className="lp-table-wrapper">
                <table className="lp-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Session Mode</th>
                      <th>Duration</th>
                      <th>Rate Structure</th>
                      <th>Earned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>18 Aug 2026</td>
                      <td><span className="vz-chip sky">Video Call</span></td>
                      <td>42 min</td>
                      <td>15m Free + 27m Paid</td>
                      <td><strong>₹ 45.00</strong></td>
                      <td><span className="vz-chip mint">Credited</span></td>
                    </tr>
                    <tr>
                      <td>18 Aug 2026</td>
                      <td><span className="vz-chip lavender">Chat Support</span></td>
                      <td>29 min</td>
                      <td>15m Free + 14m Paid</td>
                      <td><strong>₹ 28.00</strong></td>
                      <td><span className="vz-chip mint">Credited</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
             VIEW 7: PROFILE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="lp-view lp-fade-in">
            {/* Profile Header */}
            <Card variant="default" padding="lg" className="lp-profile-header-card">
              <div className="lp-profile-head">
                <div className="lp-profile-avatar-lg">
                  {supporterProfile?.display_alias ? supporterProfile.display_alias.slice(0, 2).toUpperCase() : 'LP'}
                </div>
                <div>
                  <div className="lp-profile-name-row">
                    <h2>{supporterProfile?.display_alias || 'Peer Listener'}</h2>
                    <span className="vz-chip mint">
                      <ShieldCheck size={14} /> {supporterProfile?.verification_status === 'verified' ? 'Verified Listener' : (supporterProfile?.verification_status || 'Under Review')}
                    </span>
                  </div>
                  <p className="lp-profile-role">{supporterProfile?.qualification || 'Support Listener Trainee'}</p>
                  <span className="lp-profile-id">
                    {supporterProfile?.introduction ? supporterProfile.introduction.slice(0, 90) : 'Vistaraz Certified Provider Sanctuary'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast('Profile details managed via Sanctuary onboarding.')}
              >
                Profile Info
              </Button>
            </Card>

            {/* Mandatory Non-Clinical Disclosure */}
            <Card variant="sky" padding="md" style={{ marginTop: '20px' }}>
              <div className="lp-disclosure-box">
                <AlertCircle size={22} color="var(--vz-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Non-Clinical Support Listener Disclosure</strong>
                  <p style={{ fontSize: '0.88rem', marginTop: '4px', color: 'var(--vz-text-secondary)' }}>
                    Psychology students and peer listeners on Vistaraz are identified strictly as <strong>Support Listeners / Trainees</strong>. They offer empathic active listening and non-clinical emotional support. They do not diagnose psychiatric conditions or provide psychotherapy.
                  </p>
                </div>
              </div>
            </Card>

            {/* Profile Info Details */}
            <div className="lp-grid-two" style={{ marginTop: '20px' }}>
              <Card variant="default" padding="lg">
                <h3>Personal &amp; Operational Credentials</h3>
                <ul className="lp-profile-info-list">
                  <li>
                    <span className="label">Display Alias</span>
                    <strong>{supporterProfile?.display_alias || 'Listener'}</strong>
                  </li>
                  <li>
                    <span className="label">Languages Spoken</span>
                    <strong>{Array.isArray(supporterProfile?.languages) ? supporterProfile.languages.join(', ').toUpperCase() : 'English'}</strong>
                  </li>
                  <li>
                    <span className="label">Qualification / Training</span>
                    <strong>{supporterProfile?.qualification || 'Peer Support Trainee'}</strong>
                  </li>
                  <li>
                    <span className="label">Supported Age Bands</span>
                    <strong>{Array.isArray(supporterProfile?.supported_age_bands) ? supporterProfile.supported_age_bands.join(', ') : '18-20, 21-25'}</strong>
                  </li>
                  <li>
                    <span className="label">Concurrent Sessions Limit</span>
                    <strong>{supporterProfile?.max_active_sessions || 2} Active Sessions</strong>
                  </li>
                </ul>
              </Card>

              <Card variant="default" padding="lg">
                <h3>Care Credentials &amp; Verification</h3>
                <ul className="lp-profile-info-list">
                  <li>
                    <span className="label">Verification Status</span>
                    <strong style={{ color: supporterProfile?.verification_status === 'verified' ? 'var(--vz-success)' : '#f59e0b' }}>
                      ● {supporterProfile?.verification_status === 'verified' ? 'Cleared & Approved' : (supporterProfile?.verification_status || 'Pending')}
                    </strong>
                  </li>
                  <li>
                    <span className="label">Mandatory Training</span>
                    <strong style={{ color: 'var(--vz-success)' }}>
                      ● {supporterProfile?.training_status === 'completed' ? 'Level 1 & 2 Completed' : (supporterProfile?.training_status || 'Underway')}
                    </strong>
                  </li>
                  <li>
                    <span className="label">Minor (15–17) Safeguarding</span>
                    <strong>{supporterProfile?.safeguarding_approved ? 'Approved (Specialized Gate)' : 'Adults 18–25 Pilot Only'}</strong>
                  </li>
                  <li>
                    <span className="label">Emergency Escalation Link</span>
                    <strong>Tele-MANAS (14416) &amp; Kiran (1800-599-0019) Active</strong>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL 1: Schedule Configuration ── */}
      {scheduleModalOpen && (
        <div className="lp-modal-backdrop" onClick={() => setScheduleModalOpen(false)}>
          <div className="lp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h3>Configure Availability Schedule</h3>
              <button className="lp-close-btn" onClick={() => setScheduleModalOpen(false)}>✕</button>
            </div>
            <div className="lp-modal-body">
              <label className="lp-form-field">
                <span>Working Hours (Daily)</span>
                <input type="text" defaultValue="10:00 AM – 6:00 PM IST" className="lp-input" />
              </label>
              <label className="lp-form-field">
                <span>Maximum Daily Sessions</span>
                <input type="number" defaultValue={6} min={1} max={12} className="lp-input" />
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--vz-text-secondary)', marginTop: '8px' }}>
                Your schedule determines when the automatic intake matching engine pairs you with student inquiries.
              </p>
            </div>
            <div className="lp-modal-footer">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setScheduleModalOpen(false); showToast('Schedule updated successfully.'); }}
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Live Chat with Seeker ── */}
      {chatModalOpen && (
        <div className="lp-modal-backdrop" onClick={() => setChatModalOpen(false)}>
          <div className="lp-modal-box lp-chat-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <div>
                <h3>Live Chat: Anonymous_8821</h3>
                <span className="lp-subtext">Encrypted End-to-End · Session Active</span>
              </div>
              <button className="lp-close-btn" onClick={() => setChatModalOpen(false)}>✕</button>
            </div>
            <div className="lp-chat-messages-wrap">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`lp-chat-bubble ${msg.sender}`}>
                  <span className="lp-bubble-sender">
                    {msg.sender === 'listener' ? 'You (Listener)' : 'Anonymous_8821'} · {msg.time}
                  </span>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <form className="lp-chat-composer" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type an empathic response..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="lp-input"
              />
              <Button variant="primary" size="sm" type="submit" icon={<Send size={14} />}>
                Send
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Supervisor Escalation / Report ── */}
      {reportModalOpen && (
        <div className="lp-modal-backdrop" onClick={() => setReportModalOpen(false)}>
          <div className="lp-modal-box" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="var(--vz-pastel-peach-text)" />
                <h3>Safeguarding Escalation Protocol</h3>
              </div>
              <button className="lp-close-btn" onClick={() => setReportModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="lp-modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-secondary)', marginBottom: '14px' }}>
                  If you suspect active self-harm risk, abuse, or urgent distress, trigger this escalation. A clinical supervisor will be patched into the session immediately.
                </p>
                <label className="lp-form-field">
                  <span>Seeker Subject</span>
                  <input type="text" value={reportTarget} readOnly className="lp-input" />
                </label>
                <label className="lp-form-field">
                  <span>Escalation Category</span>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="lp-input"
                  >
                    <option>Safety Concern / Crisis Risk</option>
                    <option>Harassment or Abusive Conduct</option>
                    <option>Request for Inappropriate Relationship</option>
                    <option>Severe Clinical Needs Exceeding Peer Scope</option>
                  </select>
                </label>
                <label className="lp-form-field">
                  <span>Session Notes &amp; Observations</span>
                  <textarea
                    rows={3}
                    placeholder="Provide objective behavioral observations for the clinical lead..."
                    value={reportNotes}
                    onChange={e => setReportNotes(e.target.value)}
                    className="lp-input"
                    required
                  />
                </label>
              </div>
              <div className="lp-modal-footer">
                <Button variant="outline" size="sm" type="button" onClick={() => setReportModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#dc2626', color: '#fff' }}>
                  Submit Escalation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
