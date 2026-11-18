import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SupportDisclaimerModal from '../components/common/SupportDisclaimerModal';
import { useAuth } from '../context/AuthContext';
import {
  getMySessions,
  getSessionById,
  getSessionMessages,
  sendSessionMessage,
  endSession,
  submitSessionFeedback,
  reportSessionConcern,
  scheduleVoiceSession,
  issueVoiceToken,
} from '../services/peerSupportService';
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
  Phone,
  PhoneOff,
  Send,
  Loader2,
  X,
  Star,
  Mic,
  MicOff,
  Flag,
} from 'lucide-react';
import './ChatPage.css';

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, seekerProfile, isAuthenticated } = useAuth();

  const sessionIdFromUrl = searchParams.get('session');

  // Disclaimer modal state
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Active view tab in side drawer
  const [sideTab, setSideTab] = useState('privacy'); // 'privacy' | 'safety'

  // Real Session & Message State
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals & Voice State
  const [scheduleVoiceOpen, setScheduleVoiceOpen] = useState(false);
  const [voiceDateTime, setVoiceDateTime] = useState('');
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [voiceMicMuted, setVoiceMicMuted] = useState(false);
  const [voiceCallTime, setVoiceCallTime] = useState(0);
  const [voiceTokenData, setVoiceTokenData] = useState(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('safety_concern');
  const [reportDescription, setReportDescription] = useState('');

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('empathetic_listening');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const messagesEndRef = useRef(null);

  const seekerName = seekerProfile?.realName || user?.seekerProfile?.realName || user?.name || 'Support Seeker';

  // 1. Load active session
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        if (sessionIdFromUrl) {
          const session = await getSessionById(sessionIdFromUrl);
          if (isMounted) setActiveSession(session);
        } else {
          const all = await getMySessions();
          const active = all?.find((s) => ['scheduled', 'in_progress', 'active'].includes(s.session_status));
          if (isMounted) setActiveSession(active || null);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, sessionIdFromUrl]);

  // 2. Fetch and poll messages
  const fetchMessages = async () => {
    if (!activeSession?.id) return;
    try {
      const msgs = await getSessionMessages(activeSession.id, 100);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (!activeSession?.id) return;
    fetchMessages();

    // Auto-poll if session is active
    if (activeSession.session_status !== 'completed' && activeSession.session_status !== 'ended') {
      const interval = setInterval(fetchMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [activeSession?.id, activeSession?.session_status]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice call timer
  useEffect(() => {
    let timer;
    if (voiceCallActive) {
      timer = setInterval(() => {
        setVoiceCallTime((prev) => prev + 1);
      }, 1000);
    } else {
      setVoiceCallTime(0);
    }
    return () => clearInterval(timer);
  }, [voiceCallActive]);

  // 3. Message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession?.id || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await sendSessionMessage(activeSession.id, text);
      await fetchMessages();
    } catch (err) {
      alert(err.message || 'Failed to send message');
      setInputText(text); // Restore on error
    } finally {
      setSending(false);
    }
  };

  // 4. Session end
  const handleEndSession = async () => {
    if (!activeSession?.id) return;
    if (!window.confirm('Are you sure you want to conclude this support session?')) return;
    try {
      await endSession(activeSession.id);
      setActiveSession((prev) => (prev ? { ...prev, session_status: 'completed' } : null));
      setFeedbackModalOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to end session');
    }
  };

  // 5. Voice schedule
  const handleScheduleVoice = async (e) => {
    e.preventDefault();
    if (!voiceDateTime || !activeSession?.id) return;
    try {
      await scheduleVoiceSession(activeSession.id, new Date(voiceDateTime).toISOString());
      setScheduleVoiceOpen(false);
      alert('Voice session scheduled successfully.');
      const updated = await getSessionById(activeSession.id);
      setActiveSession(updated);
    } catch (err) {
      alert(err.message || 'Failed to schedule voice session');
    }
  };

  // 6. Voice room join token
  const handleStartVoiceCall = async () => {
    if (!activeSession?.id) return;
    try {
      const tokenRes = await issueVoiceToken(activeSession.id);
      setVoiceTokenData(tokenRes);
      setVoiceCallActive(true);
    } catch (err) {
      alert(err.message || 'Unable to initialize voice room.');
    }
  };

  // 7. Submit incident report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!activeSession?.id || !reportDescription.trim()) return;
    try {
      await reportSessionConcern(activeSession.id, {
        reportType,
        description: reportDescription.trim(),
      });
      setReportModalOpen(false);
      setReportDescription('');
      alert('Safety report submitted to trust & safety lead. Thank you for keeping our community safe.');
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    }
  };

  // 8. Submit feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!activeSession?.id) return;
    try {
      await submitSessionFeedback(activeSession.id, {
        rating: feedbackRating,
        feedbackCategory,
        notes: feedbackNotes.trim(),
      });
      setFeedbackModalOpen(false);
      alert('Thank you for your feedback! It helps maintain a high standard of peer care.');
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  const isSessionEnded = activeSession?.session_status === 'completed' || activeSession?.session_status === 'ended';
  const isMe = (senderId) => senderId === user?.id;

  const formatSec = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <AppLayout headerVariant="client-dashboard">
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
            {activeSession ? (
              <div className="vz-chat-status-pill" style={{ backgroundColor: isSessionEnded ? '#f1f5f9' : '#ecfdf5', color: isSessionEnded ? '#475569' : '#059669', border: '1px solid currentColor' }}>
                <span className="vz-chat-pulse-dot" style={{ backgroundColor: isSessionEnded ? '#94a3b8' : '#10b981' }} />
                <span>{isSessionEnded ? 'Session Concluded' : 'Active Session'}</span>
              </div>
            ) : (
              <div className="vz-chat-status-pill vz-chat-status-pill--staging">
                <span className="vz-chat-pulse-dot" />
                <span>No Active Session</span>
              </div>
            )}
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
                  <h1 className="vz-stage-title">
                    {activeSession ? 'Peer Support Conversation' : 'Peer Support Queue'}
                  </h1>
                  <p className="vz-stage-subtitle">
                    {activeSession
                      ? `Connected in safe, judgment-free emotional listening.`
                      : 'Connect with trained, empathetic peer listeners.'}
                  </p>
                </div>
              </div>

              <div className="vz-stage-header__meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {activeSession && !isSessionEnded && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScheduleVoiceOpen(true)}
                      icon={<Calendar size={13} />}
                    >
                      Schedule Voice
                    </Button>
                    {activeSession.session_type === 'audio' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleStartVoiceCall}
                        icon={<Phone size={13} />}
                      >
                        {voiceCallActive ? 'Voice Active' : 'Join Call'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReportModalOpen(true)}
                      icon={<Flag size={13} />}
                      title="Report Concern"
                    >
                      Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={handleEndSession}
                    >
                      End
                    </Button>
                  </>
                )}
                <div className="vz-meta-tag">
                  <Lock size={12} />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>
            </header>

            {/* In-Call WebRTC Status Banner */}
            {voiceCallActive && (
              <div style={{
                backgroundColor: '#1e1b4b',
                color: '#ffffff',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #312e81'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'vz-pulse 1.5s infinite' }} />
                  <strong>WebRTC Audio Room Active</strong>
                  <span style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>({formatSec(voiceCallTime)})</span>
                  <span style={{ fontSize: '0.78rem', color: '#a5b4fc', marginLeft: '6px' }}>• Peer-to-Peer · Not Recorded</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{ background: voiceMicMuted ? '#ef4444' : '#3730a3', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    onClick={() => setVoiceMicMuted(!voiceMicMuted)}
                  >
                    {voiceMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                    {voiceMicMuted ? 'Muted' : 'Mute'}
                  </button>
                  <button
                    type="button"
                    style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                    onClick={() => setVoiceCallActive(false)}
                  >
                    <PhoneOff size={14} /> Leave Call
                  </button>
                </div>
              </div>
            )}

            {/* Conversation Stream */}
            <div className="vz-stage-stream" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Privacy Notice Banner */}
              <div className="vz-stream-notice">
                <Shield size={14} color="var(--vz-primary)" />
                <span>
                  <strong>Privacy Safeguard:</strong> Your real name (<em>{seekerName}</em>) and email are strictly shielded.
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--vz-text-muted)' }}>
                  <Loader2 size={32} className="vz-spin" style={{ margin: '0 auto 12px' }} />
                  <p>Loading session sanctuary...</p>
                </div>
              ) : activeSession ? (
                /* Active Session Messages */
                <div className="vz-msg-container">
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--vz-text-secondary)' }}>
                      <p style={{ margin: 0, fontSize: '0.94rem' }}>
                        Welcome to your confidential listening session. Send a message to say hello and share what's on your mind.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = isMe(m.sender_user_id);
                      return (
                        <div key={m.id} className={`vz-msg-row ${mine ? 'vz-msg-row--me' : 'vz-msg-row--them'}`}>
                          <span className="vz-msg-sender">{mine ? 'You (Seeker)' : 'Peer Listener'}</span>
                          <div className={`vz-msg-bubble ${mine ? 'vz-msg-bubble--me' : 'vz-msg-bubble--them'}`}>
                            {m.message_body}
                          </div>
                          <span className="vz-msg-time">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* No Active Session State */
                <div className="vz-queue-staging-card">
                  <div className="vz-queue-icon-bubble" aria-hidden="true">
                    <MessageSquare size={32} />
                  </div>
                  <span className="vz-chip lavender" style={{ margin: '0 auto 12px' }}>
                    PEER SUPPORT SPACE
                  </span>
                  <h2 className="vz-queue-staging-title">No Active Session</h2>
                  <p className="vz-queue-staging-desc">
                    You are not currently in an active peer support conversation. When you request a peer listener, your private conversation will open right here.
                  </p>
                  <div className="vz-queue-actions" style={{ maxWidth: '320px', margin: '0 auto' }}>
                    <Button
                      to="/support"
                      variant="primary"
                      size="md"
                      icon={<ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
                    >
                      Go to Support to Request Listener
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Composer Bar */}
            <footer className="vz-stage-composer-bar">
              {isSessionEnded ? (
                <div className="vz-composer-disabled-banner">
                  <Info size={16} />
                  <span>This session has concluded. To talk with a listener again, start a new request from the Support page.</span>
                </div>
              ) : activeSession ? (
                <form className="vz-composer-active-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="vz-composer-active-input"
                    placeholder="Type your message here... Take your time."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={sending || !inputText.trim()}
                    icon={sending ? <Loader2 size={16} className="vz-spin" /> : <Send size={16} />}
                  >
                    Send
                  </Button>
                </form>
              ) : (
                <div className="vz-composer-disabled-banner">
                  <Info size={16} />
                  <span>Message composer is inactive when no live session is assigned.</span>
                </div>
              )}
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

      {/* ── Modal: Schedule Voice Session ── */}
      {scheduleVoiceOpen && (
        <div className="vz-modal-backdrop" onClick={() => setScheduleVoiceOpen(false)}>
          <div className="vz-modal-card" style={{ maxWidth: '440px', padding: '28px 24px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Schedule Voice Session</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', marginBottom: '20px' }}>
              Select a date and time to hold your voice conversation with your peer listener:
            </p>
            <form onSubmit={handleScheduleVoice}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Scheduled Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="vz-input"
                  value={voiceDateTime}
                  onChange={(e) => setVoiceDateTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  Confirm Time
                </Button>
                <Button type="button" variant="outline" size="md" onClick={() => setScheduleVoiceOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Report Concern ── */}
      {reportModalOpen && (
        <div className="vz-modal-backdrop" onClick={() => setReportModalOpen(false)}>
          <div className="vz-modal-card" style={{ maxWidth: '460px', padding: '28px 24px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Report Session Concern</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', marginBottom: '20px' }}>
              Your report goes directly to our trust &amp; safety lead for immediate review:
            </p>
            <form onSubmit={handleReportSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Report Reason
                </label>
                <select
                  className="vz-input"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                >
                  <option value="safety_concern">Safety Concern / Self-Harm Risk</option>
                  <option value="boundary_violation">Boundary Violation</option>
                  <option value="inappropriate_behavior">Inappropriate Language or Behavior</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Details &amp; Observations
                </label>
                <textarea
                  required
                  rows={4}
                  className="vz-input"
                  placeholder="Describe what occurred during the session..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  Submit Report
                </Button>
                <Button type="button" variant="outline" size="md" onClick={() => setReportModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Post-Session Feedback ── */}
      {feedbackModalOpen && (
        <div className="vz-modal-backdrop" onClick={() => setFeedbackModalOpen(false)}>
          <div className="vz-modal-card" style={{ maxWidth: '460px', padding: '28px 24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ede9fe', color: 'var(--vz-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Heart size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>How was your conversation?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', marginBottom: '20px' }}>
              Your feedback is anonymous and helps our community listeners grow:
            </p>
            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    onClick={() => setFeedbackRating(star)}
                  >
                    <Star
                      size={28}
                      fill={star <= feedbackRating ? '#f59e0b' : 'none'}
                      color={star <= feedbackRating ? '#f59e0b' : '#cbd5e1'}
                    />
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  rows={3}
                  className="vz-input"
                  placeholder="Optional reflections (e.g. 'Felt heard and supported')..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  Submit Reflection
                </Button>
                <Button type="button" variant="outline" size="md" onClick={() => setFeedbackModalOpen(false)}>
                  Skip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
