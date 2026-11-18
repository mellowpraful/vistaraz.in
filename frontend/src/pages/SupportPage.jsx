import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoginGate from '../components/common/LoginGate';
import { useAuth } from '../context/AuthContext';
import {
  createSupportRequest,
  getMySupportRequests,
  cancelSupportRequest,
  getMatchStatus,
  confirmMatch,
} from '../services/peerSupportService';
import {
  MessageSquare,
  Video,
  UserCheck,
  Star,
  CheckCircle2,
  Shield,
  ArrowRight,
  Sparkles,
  Phone,
  Search,
  Filter,
  X,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Clock,
  HeartHandshake,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import './SupportPage.css';

// Verified National Mental Health Resources & Partner Clinical Care
const VERIFIED_CLINICAL_RESOURCES = [
  {
    id: 'tele-manas',
    name: 'Tele-MANAS (Govt. of India)',
    title: 'National Tele Mental Health Programme',
    affiliation: 'Ministry of Health & Family Welfare',
    helpline: '14416',
    altHelpline: '1800-891-4416',
    languages: ['Hindi', 'English', '20+ Indian Languages'],
    specialties: ['Clinical Evaluation', 'Crisis Counseling', 'Psychiatric Guidance'],
    bio: 'India’s 24/7 free national digital mental health service providing immediate access to certified counselors and clinical mental health specialists.',
    type: 'psychologist',
    isEmergency: true,
  },
  {
    id: 'nimhans',
    name: 'NIMHANS Center for Well-Being',
    title: 'Institute of National Importance',
    affiliation: 'National Institute of Mental Health and Neurosciences',
    helpline: '080-46110007',
    altHelpline: null,
    languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
    specialties: ['Youth & Student Mental Health', 'Anxiety & Mood Disorders', 'Clinical Therapy'],
    bio: 'Premier national mental health institution offering evidence-based psychosocial support and clinical interventions for youth and young adults.',
    type: 'psychologist',
    isEmergency: false,
  },
  {
    id: 'vandrevala-foundation',
    name: 'Vandrevala Foundation',
    title: 'Professional Mental Health Counseling',
    affiliation: 'Accredited Mental Health NGO',
    helpline: '+919999666555',
    altHelpline: '9999 666 555',
    languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
    specialties: ['Crisis Counseling', 'Depression & Burnout', 'Relationship Stress'],
    bio: 'Round-the-clock professional counseling network staffed by qualified psychologists and trained clinical counselors.',
    type: 'counselor',
    isEmergency: true,
  },
  {
    id: 'kiran-helpline',
    name: 'KIRAN Helpline',
    title: 'National Mental Health Helpline',
    affiliation: 'Department of Empowerment of Persons with Disabilities',
    helpline: '1800-599-0019',
    altHelpline: null,
    languages: ['13 Indian Languages'],
    specialties: ['Mental Wellbeing', 'Stress Management', 'Psychological Rehabilitation'],
    bio: 'Toll-free 24/7 helpline providing initial screening, psychological first aid, and clinical mental health referrals across India.',
    type: 'psychiatrist',
    isEmergency: false,
  },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'listeners', 'psychologists', 'psychiatrists', 'counselors'
  const [selectedResource, setSelectedResource] = useState(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [gateContent, setGateContent] = useState({
    title: 'Continue Your Journey',
    description: 'Sign in to continue and explore more of Vistaraz.',
    badgeText: 'Sanctuary Access',
  });

  // Active Peer Support Request State
  const [activeRequest, setActiveRequest] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [youthModalOpen, setYouthModalOpen] = useState(false);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const [crisisDetails, setCrisisDetails] = useState(null);
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);
  const [intakeError, setIntakeError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    category: 'stress',
    preferredLanguage: 'en',
    communicationMode: 'text',
    ageBand: '18-20',
    concernDescription: '',
  });

  // Fetch active seeker support request
  const fetchActiveRequest = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingRequest(true);
      const requests = await getMySupportRequests();
      const current = requests?.find((r) =>
        ['requested', 'open', 'matching', 'offered', 'awaiting_seeker_confirmation', 'confirmed', 'matched'].includes(r.status)
      );
      setActiveRequest(current || null);
      if (current) {
        const match = await getMatchStatus(current.id);
        setMatchDetails(match);
      }
    } catch (err) {
      console.error('Error fetching support request:', err);
    } finally {
      setLoadingRequest(false);
    }
  };

  useEffect(() => {
    fetchActiveRequest();
  }, [isAuthenticated]);

  // Polling for matching updates while request is in progress
  useEffect(() => {
    if (!activeRequest || !['matching', 'offered', 'awaiting_seeker_confirmation'].includes(activeRequest.status)) {
      return;
    }
    const interval = setInterval(async () => {
      try {
        const match = await getMatchStatus(activeRequest.id);
        setMatchDetails(match);
        if (match.status !== activeRequest.status) {
          setActiveRequest((prev) => (prev ? { ...prev, status: match.status } : null));
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRequest?.id, activeRequest?.status]);

  const handleOpenIntake = () => {
    if (!isAuthenticated) {
      setGateContent({
        title: 'Request a Peer Listener',
        description: 'Sign in to access our free, confidential peer support matching sanctuary.',
        badgeText: 'Peer Support Access',
      });
      setShowLoginGate(true);
      return;
    }
    setIntakeError(null);
    setIntakeModalOpen(true);
  };

  const handleCancelRequest = async () => {
    if (!activeRequest) return;
    if (!window.confirm('Are you sure you want to cancel your peer support request?')) return;
    try {
      setActionLoading(true);
      await cancelSupportRequest(activeRequest.id);
      setActiveRequest(null);
      setMatchDetails(null);
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmMatch = async (decision) => {
    if (!activeRequest) return;
    try {
      setActionLoading(true);
      const res = await confirmMatch(activeRequest.id, {
        candidateId: matchDetails?.candidateId,
        decision,
      });
      if (decision === 'accept' && res?.sessionId) {
        navigate(`/chat?session=${res.sessionId}`);
      } else {
        await fetchActiveRequest();
      }
    } catch (err) {
      alert(err.message || 'Error confirming match');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitIntake = async (e) => {
    e.preventDefault();
    setIntakeError(null);

    // Minor Safeguarding Gate: Ages 15-17
    if (formData.ageBand === '15-17') {
      setIntakeModalOpen(false);
      setYouthModalOpen(true);
      try {
        await createSupportRequest(formData);
      } catch (err) {
        // Backend handles youth holding safely
      }
      return;
    }

    try {
      setIntakeSubmitting(true);
      const res = await createSupportRequest(formData);
      setIntakeModalOpen(false);
      if (res?.crisisIntervention) {
        setCrisisDetails(res);
        setCrisisModalOpen(true);
      } else {
        await fetchActiveRequest();
      }
    } catch (err) {
      if (err.data?.code === 'CRISIS_INTERCEPTED') {
        setIntakeModalOpen(false);
        setCrisisDetails(err.data);
        setCrisisModalOpen(true);
      } else if (err.data?.code === 'YOUTH_SAFEGUARDING_HOLD') {
        setIntakeModalOpen(false);
        setYouthModalOpen(true);
      } else {
        setIntakeError(err.message || 'Failed to submit support request');
      }
    } finally {
      setIntakeSubmitting(false);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Resources' },
    { id: 'listeners', label: 'Peer Support' },
    { id: 'psychologists', label: 'Clinical Psychologists' },
    { id: 'psychiatrists', label: 'Psychiatry & Medical' },
    { id: 'counselors', label: 'Professional Counselors' },
  ];

  const filteredResources = VERIFIED_CLINICAL_RESOURCES.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'psychologists') return p.type === 'psychologist';
    if (activeTab === 'psychiatrists') return p.type === 'psychiatrist';
    if (activeTab === 'counselors') return p.type === 'counselor';
    return false;
  });

  const showListeners = activeTab === 'all' || activeTab === 'listeners';
  const showPros = activeTab !== 'listeners';

  return (
    <AppLayout>
      <div className="vz-support-page">
        {/* Header Hero */}
        <section className="vz-support-header">
          <span className="vz-eyebrow">CHOOSE YOUR NEXT STEP</span>
          <h1 className="vz-support-header__title">
            Support that feels <em className="vz-text-violet">right for you.</em>
          </h1>
          <p className="vz-support-header__desc">
            Choose from trained peer listeners for free chat, or verified clinicians for deeper care. You can change your support at any time.
          </p>

          {/* Filter Pills */}
          <div className="vz-support-filter-bar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`vz-support-filter-pill ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Level 01: Peer Support Section */}
        {showListeners && (
          <section className="vz-support-section" style={{ marginBottom: '48px' }}>
            <div className="vz-support-section__title-row">
              <div>
                <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
                  LEVEL 01 · PEER SUPPORT SANCTUARY
                </span>
                <h2>Start with someone who listens.</h2>
                <p style={{ marginTop: '4px', fontSize: '0.95rem', color: 'var(--vz-text-secondary)' }}>
                  Free, confidential, empathetic 1-on-1 emotional grounding with trained peer listeners.
                </p>
              </div>
              <span className="vz-chip mint">
                Free Community Beta
              </span>
            </div>

            {/* A. If Active Request Exists */}
            {activeRequest ? (
              <Card variant="default" padding="lg" style={{ borderRadius: '20px', border: '1px solid var(--vz-primary-light)' }}>
                {activeRequest.status === 'awaiting_seeker_confirmation' ? (
                  /* 1. Mutual Confirmation Screen */
                  <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <HeartHandshake size={32} />
                    </div>
                    <span className="vz-chip mint" style={{ display: 'inline-block', marginBottom: '8px' }}>
                      Listener Found · Confirmation Required
                    </span>
                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px', color: 'var(--vz-text-primary)' }}>
                      Connect with {matchDetails?.supporter?.alias || 'Peer Listener'}?
                    </h3>
                    <p style={{ color: 'var(--vz-text-secondary)', maxWidth: '520px', margin: '0 auto 20px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      A trained peer listener has reviewed your request category and is available to listen right now. Both participants must confirm to establish a session.
                    </p>

                    <div style={{
                      backgroundColor: 'var(--vz-bg-subtle)',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      maxWidth: '460px',
                      margin: '0 auto 24px',
                      display: 'flex',
                      justifyContent: 'space-around',
                      textAlign: 'left'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--vz-text-muted)', textTransform: 'uppercase' }}>Preferred Mode</div>
                        <strong style={{ fontSize: '0.92rem', textTransform: 'capitalize' }}>{activeRequest.communication_mode || 'Text Chat'}</strong>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--vz-text-muted)', textTransform: 'uppercase' }}>Language</div>
                        <strong style={{ fontSize: '0.92rem', textTransform: 'uppercase' }}>{activeRequest.preferred_language || 'EN'}</strong>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--vz-text-muted)', textTransform: 'uppercase' }}>Category</div>
                        <strong style={{ fontSize: '0.92rem', textTransform: 'capitalize' }}>{activeRequest.category}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="primary"
                        size="md"
                        disabled={actionLoading}
                        onClick={() => handleConfirmMatch('accept')}
                        icon={<CheckCircle2 size={16} />}
                      >
                        {actionLoading ? 'Connecting...' : 'Accept & Start Session'}
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        disabled={actionLoading}
                        onClick={() => handleConfirmMatch('decline')}
                      >
                        Decline &amp; Rematch
                      </Button>
                    </div>
                  </div>
                ) : activeRequest.status === 'confirmed' || activeRequest.status === 'matched' ? (
                  /* 2. Confirmed & Connected State */
                  <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', margin: '0 0 8px' }}>You are Connected!</h3>
                    <p style={{ color: 'var(--vz-text-secondary)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
                      Your private session with {matchDetails?.supporter?.alias || 'your peer listener'} is active.
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      to={matchDetails?.sessionId ? `/chat?session=${matchDetails.sessionId}` : '/chat'}
                      icon={<ArrowRight size={16} />}
                    >
                      Open Session Chat
                    </Button>
                  </div>
                ) : (
                  /* 3. Matching In Progress State */
                  <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#ede9fe',
                      color: 'var(--vz-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      animation: 'pulse 2s infinite'
                    }}>
                      <Loader2 size={32} className="vz-spin" />
                    </div>
                    <span className="vz-chip lavender" style={{ display: 'inline-block', marginBottom: '8px' }}>
                      Intelligent Matching Active
                    </span>
                    <h3 style={{ fontSize: '1.35rem', margin: '0 0 8px' }}>
                      Finding an Available Peer Listener...
                    </h3>
                    <p style={{ color: 'var(--vz-text-secondary)', maxWidth: '520px', margin: '0 auto 24px', fontSize: '0.92rem', lineHeight: 1.5 }}>
                      We are matching your request for <strong>{activeRequest.category}</strong> support with verified, online peer listeners fluent in your preferred language. You will receive an offer the moment a listener is available.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading}
                        onClick={handleCancelRequest}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              /* B. Default State: Request a Peer Listener */
              <Card variant="default" padding="lg" style={{ borderRadius: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', margin: '0 0 10px', color: 'var(--vz-text-primary)' }}>
                      Talk through what's on your mind.
                    </h3>
                    <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '20px' }}>
                      Whether you are experiencing academic burnout, loneliness, anxiety, or transition stress, our trained peer listeners provide a supportive, judgment-free space to talk.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--vz-text-secondary)' }}>
                        <CheckCircle2 size={16} color="var(--vz-primary)" />
                        <span><strong>100% Confidential:</strong> Your real name and email are never shared with listeners.</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--vz-text-secondary)' }}>
                        <CheckCircle2 size={16} color="var(--vz-primary)" />
                        <span><strong>Vetted Listeners:</strong> Community listeners trained in active listening and psychological first aid.</span>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--vz-text-secondary)' }}>
                        <CheckCircle2 size={16} color="var(--vz-primary)" />
                        <span><strong>Mutual Consent:</strong> You review the listener before any conversation begins.</span>
                      </li>
                    </ul>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleOpenIntake}
                      icon={<ArrowRight size={16} />}
                    >
                      Connect with a Peer Listener
                    </Button>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--vz-bg-subtle)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid var(--vz-border-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Shield size={20} color="var(--vz-primary)" />
                      <strong style={{ fontSize: '0.95rem' }}>Non-Clinical Safety Notice</strong>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--vz-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      Peer listeners provide empathetic emotional listening and safe psychological grounding. They are not psychologists, psychiatrists, or medical clinicians. If you need clinical diagnosis, psychiatric therapy, or are in crisis, please utilize the professional resources below.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </section>
        )}

        {/* Level 02 & 03: Professional Help & National Clinical Resources */}
        {showPros && (
          <section className="vz-support-section" style={{ marginTop: '24px' }}>
            <div className="vz-support-section__title-row">
              <div>
                <span className="vz-eyebrow" style={{ color: '#d97706' }}>
                  LEVEL 02 &amp; 03 · PROFESSIONAL CLINICAL CARE &amp; HELPLINES
                </span>
                <h2>Professional Care &amp; National Helplines</h2>
                <p style={{ marginTop: '4px', fontSize: '0.95rem', color: 'var(--vz-text-secondary)' }}>
                  When peer listening isn't enough, connect with accredited mental health organizations and licensed professionals.
                </p>
              </div>
            </div>

            {/* Beta Partner Notice Banner */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <Shield size={20} color="var(--vz-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--vz-text-primary)' }}>Accredited Partner Telehealth Notice: </strong>
                Vistaraz is currently onboarding and credentialing licensed clinical psychologists and psychiatrists across India under national telehealth standards. Direct in-app video appointments will open in Phase 2. For immediate, free clinical counseling and psychiatric guidance, connect directly with the verified national services below.
              </div>
            </div>

            <div className="vz-pros-layout">
              <div className="vz-pros-grid">
                {filteredResources.map((res) => (
                  <Card key={res.id} variant="default" padding="lg" hoverable={true} className="vz-pro-card">
                    <div className="vz-pro-card__top">
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        backgroundColor: res.isEmergency ? '#fef2f2' : '#eff6ff',
                        color: res.isEmergency ? '#dc2626' : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                        fontWeight: 700
                      }}>
                        {res.isEmergency ? '🚨' : '🏥'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.18rem', margin: '0 0 2px' }}>{res.name}</h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--vz-primary)', fontWeight: 600, margin: 0 }}>{res.title}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--vz-text-muted)', margin: '2px 0 0' }}>{res.affiliation}</p>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', margin: '14px 0', minHeight: '44px' }}>
                      {res.bio}
                    </p>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {res.specialties.map((s) => (
                        <span key={s} className="vz-chip mint">{s}</span>
                      ))}
                    </div>

                    <div style={{
                      backgroundColor: 'var(--vz-bg-subtle)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <span style={{ color: 'var(--vz-text-muted)' }}>Helpline:</span>
                      <strong style={{ color: 'var(--vz-text-primary)' }}>{res.altHelpline || res.helpline}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a
                        href={`tel:${res.helpline}`}
                        className="vz-btn vz-btn--primary vz-btn--sm"
                        style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                      >
                        <Phone size={14} style={{ marginRight: '6px' }} /> Call Free (24/7)
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedResource(res)}
                      >
                        Info
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Modal: Seeker Support Intake Form ── */}
        {intakeModalOpen && (
          <div className="vz-modal-backdrop" onClick={() => setIntakeModalOpen(false)}>
            <div className="vz-modal-card" style={{ maxWidth: '540px', padding: '32px 28px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ede9fe', color: 'var(--vz-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Request a Peer Listener</h3>
                    <small style={{ color: 'var(--vz-text-muted)' }}>Free · Anonymous · Confidential</small>
                  </div>
                </div>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vz-text-muted)' }}
                  onClick={() => setIntakeModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {intakeError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#b91c1c', fontSize: '0.88rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={16} />
                  <span>{intakeError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitIntake}>
                {/* 1. Category */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    What would you like support with?
                  </label>
                  <select
                    className="vz-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                  >
                    <option value="stress">Stress &amp; Burnout</option>
                    <option value="anxiety">Anxiety &amp; Overthinking</option>
                    <option value="academics">Academic &amp; Exam Pressure</option>
                    <option value="loneliness">Loneliness &amp; Transitions</option>
                    <option value="relationships">Relationship &amp; Social Strain</option>
                    <option value="general_wellbeing">General Emotional Wellbeing</option>
                  </select>
                </div>

                {/* 2. Preferred Language */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    Preferred Language
                  </label>
                  <select
                    className="vz-input"
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>

                {/* 3. Communication Mode */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    Preferred Communication Mode
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: formData.communicationMode === 'text' ? '2px solid var(--vz-primary)' : '1px solid var(--vz-border-light)',
                        backgroundColor: formData.communicationMode === 'text' ? '#f5f3ff' : 'var(--vz-bg-surface)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.88rem'
                      }}
                      onClick={() => setFormData({ ...formData, communicationMode: 'text' })}
                    >
                      💬 Text Chat
                      <div style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--vz-text-muted)' }}>Encrypted instant messaging</div>
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: formData.communicationMode === 'voice' ? '2px solid var(--vz-primary)' : '1px solid var(--vz-border-light)',
                        backgroundColor: formData.communicationMode === 'voice' ? '#f5f3ff' : 'var(--vz-bg-surface)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.88rem'
                      }}
                      onClick={() => setFormData({ ...formData, communicationMode: 'voice' })}
                    >
                      🎙️ Scheduled Voice
                      <div style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--vz-text-muted)' }}>Audio call with peer listener</div>
                    </button>
                  </div>
                </div>

                {/* 4. Age Band (Controlled Pilot Safeguard) */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    Your Age Band
                  </label>
                  <select
                    className="vz-input"
                    value={formData.ageBand}
                    onChange={(e) => setFormData({ ...formData, ageBand: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}
                  >
                    <option value="18-20">18–20 (College / Young Adult)</option>
                    <option value="21-25">21–25 (University / Early Career)</option>
                    <option value="15-17">15–17 (Youth / High School)</option>
                  </select>
                  <small style={{ color: 'var(--vz-text-muted)', display: 'block', marginTop: '4px' }}>
                    * The Free Beta Live Pilot is currently focused on adults aged 18–25. Youth aged 15–17 are guided to specialized national support.
                  </small>
                </div>

                {/* 5. Optional Concern Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    A few words on how you're feeling (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="vz-input"
                    placeholder="e.g. Feeling overwhelmed preparing for semester exams and need someone to talk to..."
                    value={formData.concernDescription}
                    onChange={(e) => setFormData({ ...formData, concernDescription: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--vz-border-light)', resize: 'vertical' }}
                  />
                </div>

                {/* Clinical Disclaimer Box */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--vz-text-secondary)', lineHeight: 1.45, marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                  <strong>Safety Acknowledgement:</strong> Peer listeners provide empathetic active listening and psychological first aid. They are not licensed clinicians, psychiatrists, or emergency responders. If you are experiencing thoughts of self-harm, please contact 24/7 helplines directly.
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={intakeSubmitting}
                    fullWidth
                    icon={intakeSubmitting ? <Loader2 size={16} className="vz-spin" /> : <ArrowRight size={16} />}
                  >
                    {intakeSubmitting ? 'Submitting Request...' : 'Find a Peer Listener'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIntakeModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Youth Safeguarding Guidance (Ages 15-17) ── */}
        {youthModalOpen && (
          <div className="vz-modal-backdrop" onClick={() => setYouthModalOpen(false)}>
            <div className="vz-modal-card" style={{ maxWidth: '520px', padding: '32px 24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={36} />
              </div>
              <span className="vz-chip lavender" style={{ margin: '0 auto 10px', display: 'inline-block' }}>
                Youth Safeguarding Pathway
              </span>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Dedicated Support for Ages 15–17</h3>
              <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.5 }}>
                In accordance with child digital safety standards, our live peer listening pilot is restricted to adults aged 18+. You are deeply valued and not alone — please connect directly with these free, 24/7 accredited national youth services:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
                <div style={{ backgroundColor: 'var(--vz-bg-subtle)', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Childline India</strong>
                    <small style={{ color: 'var(--vz-text-muted)' }}>24/7 dedicated helpline for children &amp; youth</small>
                  </div>
                  <a href="tel:1098" className="vz-btn vz-btn--primary vz-btn--sm" style={{ textDecoration: 'none' }}>
                    <Phone size={14} style={{ marginRight: '4px' }} /> Call 1098
                  </a>
                </div>

                <div style={{ backgroundColor: 'var(--vz-bg-subtle)', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Tele-MANAS</strong>
                    <small style={{ color: 'var(--vz-text-muted)' }}>Govt. of India National Mental Health Service</small>
                  </div>
                  <a href="tel:14416" className="vz-btn vz-btn--primary vz-btn--sm" style={{ textDecoration: 'none' }}>
                    <Phone size={14} style={{ marginRight: '4px' }} /> Call 14416
                  </a>
                </div>

                <div style={{ backgroundColor: 'var(--vz-bg-subtle)', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Kiran Helpline</strong>
                    <small style={{ color: 'var(--vz-text-muted)' }}>Toll-free psychological support across India</small>
                  </div>
                  <a href="tel:18005990019" className="vz-btn vz-btn--primary vz-btn--sm" style={{ textDecoration: 'none' }}>
                    <Phone size={14} style={{ marginRight: '4px' }} /> Call 1800-599-0019
                  </a>
                </div>
              </div>

              <Button variant="primary" fullWidth onClick={() => setYouthModalOpen(false)}>
                I Understand
              </Button>
            </div>
          </div>
        )}

        {/* ── Modal: Crisis Intercept Emergency Guidance ── */}
        {crisisModalOpen && (
          <div className="vz-modal-backdrop" onClick={() => setCrisisModalOpen(false)}>
            <div className="vz-modal-card" style={{ maxWidth: '520px', padding: '32px 24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldAlert size={36} />
              </div>
              <span className="vz-chip" style={{ backgroundColor: '#fee2e2', color: '#991b1b', margin: '0 auto 10px', display: 'inline-block' }}>
                Immediate Crisis Support
              </span>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Your Safety is Our Highest Priority</h3>
              <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Peer listeners are non-clinical supporters and cannot provide crisis care. If you are experiencing acute distress, thoughts of self-harm, or danger, please contact immediate 24/7 professional crisis counselors right now:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
                <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#9b2c2c' }}>Tele-MANAS (Govt of India)</strong>
                    <small style={{ color: '#742a2a' }}>24/7 Toll-Free National Emergency Service</small>
                  </div>
                  <a href="tel:14416" className="vz-btn vz-btn--sm" style={{ backgroundColor: '#e53e3e', color: '#fff', textDecoration: 'none' }}>
                    <Phone size={14} style={{ marginRight: '4px' }} /> Call 14416
                  </a>
                </div>

                <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#9b2c2c' }}>Vandrevala Foundation</strong>
                    <small style={{ color: '#742a2a' }}>24/7 Professional Crisis Counseling Helpline</small>
                  </div>
                  <a href="tel:+919999666555" className="vz-btn vz-btn--sm" style={{ backgroundColor: '#e53e3e', color: '#fff', textDecoration: 'none' }}>
                    <Phone size={14} style={{ marginRight: '4px' }} /> Call +91 9999 666 555
                  </a>
                </div>

                <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#9b2c2c' }}>National Emergency Services</strong>
                    <small style={{ color: '#742a2a' }}>Police, Ambulance, Emergency</small>
                  </div>
                  <a href="tel:112" className="vz-btn vz-btn--sm" style={{ backgroundColor: '#e53e3e', color: '#fff', textDecoration: 'none' }}>
                    <Phone size={14} style={{ marginRight: '4px' }} /> Call 112
                  </a>
                </div>
              </div>

              <Button variant="primary" fullWidth onClick={() => setCrisisModalOpen(false)}>
                Close Guidance
              </Button>
            </div>
          </div>
        )}

        {/* Modal: Resource Details */}
        {selectedResource && (
          <div className="vz-modal-backdrop" onClick={() => setSelectedResource(null)}>
            <div className="vz-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: selectedResource.isEmergency ? '#fef2f2' : '#eff6ff',
                  color: selectedResource.isEmergency ? '#dc2626' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 700
                }}>
                  {selectedResource.isEmergency ? '🚨' : '🏥'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', margin: '0 0 2px' }}>{selectedResource.name}</h3>
                  <p style={{ color: 'var(--vz-primary)', fontWeight: 600, margin: 0 }}>{selectedResource.title}</p>
                  <small style={{ color: 'var(--vz-text-muted)' }}>{selectedResource.affiliation}</small>
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--vz-text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                {selectedResource.bio}
              </p>

              <div style={{ backgroundColor: 'var(--vz-bg-subtle)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <strong>Helpline Number:</strong>
                  <span style={{ color: 'var(--vz-primary)', fontWeight: 700 }}>{selectedResource.altHelpline || selectedResource.helpline}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <strong>Languages:</strong>
                  <span>{selectedResource.languages.join(', ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <strong>Operating Hours:</strong>
                  <span>24 Hours · Free &amp; Confidential</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a
                  href={`tel:${selectedResource.helpline}`}
                  className="vz-btn vz-btn--primary vz-btn--lg"
                  style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                >
                  <Phone size={18} style={{ marginRight: '6px' }} /> Call Helpline Now
                </a>
                <button
                  type="button"
                  className="vz-btn vz-btn--outline vz-btn--lg"
                  onClick={() => setSelectedResource(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Gate Modal */}
      <LoginGate
        isOpen={showLoginGate}
        onClose={() => setShowLoginGate(false)}
        title={gateContent.title}
        description={gateContent.description}
        badgeText={gateContent.badgeText}
      />
    </AppLayout>
  );
}
