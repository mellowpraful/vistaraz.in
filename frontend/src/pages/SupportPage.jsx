import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoginGate from '../components/common/LoginGate';
import { useAuth } from '../context/AuthContext';
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
  Calendar
} from 'lucide-react';
import './SupportPage.css';

const LISTENERS = [
  {
    id: 'peer-listener-community',
    name: 'Trained Peer Listeners',
    role: 'Active Listening Sanctuary',
    roleTag: 'Peer Support',
    languages: ['English', 'Hindi', 'Regional Languages'],
    topics: ['Academic Stress', 'Loneliness', 'Overthinking', 'College Transitions'],
    bio: 'Empathetic, non-judgmental peer listeners trained in active listening and psychological first aid. Peer listeners provide emotional grounding and safe space to talk, but do not provide clinical therapy or medical diagnosis.',
    sessionsCount: 'Community Queue',
    available: true,
    avatar: '🌱',
    type: 'listener',
  },
];

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

  const handleStartChat = () => {
    if (!isAuthenticated) {
      setGateContent({
        title: 'Continue Your Journey',
        description: 'Sign in to access the confidential peer support queue.',
        badgeText: 'Peer Chat Support',
      });
      setShowLoginGate(true);
      return;
    }
    navigate('/chat');
  };

  const handleJoinClinicianWaitlist = () => {
    if (!isAuthenticated) {
      setGateContent({
        title: 'Join Clinical Care Notification List',
        description: 'Sign in to be notified the moment Vistaraz accredited clinical therapist appointments open.',
        badgeText: 'Care Network Waitlist',
      });
      setShowLoginGate(true);
      return;
    }
    setWaitlistSuccess(true);
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

          {/* Filter Pills matching reference image */}
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

        {/* Level 01: Chat Listeners — Coming Soon Banner */}
        {showListeners && (
          <section className="vz-support-section">
            <div className="vz-support-section__title-row">
              <div>
                <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
                  LEVEL 01 · CHAT SUPPORT
                </span>
                <h2>Start with someone who listens.</h2>
              </div>
              <span className="vz-chip lavender">
                Listener Network Preparing
              </span>
            </div>

            <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: '48px 24px', borderRadius: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ede9fe', color: 'var(--vz-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--vz-text-primary)' }}>
                Listener Support Coming Soon
              </h3>
              <p style={{ maxWidth: '580px', margin: '0 auto 24px', color: 'var(--vz-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                We are preparing a trusted listener network so you can connect with someone who is ready to listen. This service is not available yet.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button to="/assessment" variant="primary" size="md" icon={<ArrowRight size={16} />}>
                  Take a Wellbeing Assessment
                </Button>
                <Button to="/tools" variant="outline" size="md">
                  Explore Grounding Tools
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Level 02 & 03: Professional Help & National Clinical Resources */}
        {showPros && (
          <section className="vz-support-section" style={{ marginTop: '48px' }}>
            <div className="vz-support-section__title-row">
              <div>
                <span className="vz-eyebrow" style={{ color: '#d97706' }}>
                  LEVEL 02 & 03 · PROFESSIONAL CLINICAL CARE & HELPLINES
                </span>
                <h2>Professional Care & National Helplines</h2>
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

              {/* Guide Side Banner */}
              <div className="vz-pros-sidebar">
                <Card variant="lavender" padding="lg" className="vz-pro-guide-card">
                  <div className="vz-pro-guide-card__icon">
                    <Sparkles size={28} color="var(--vz-primary)" />
                  </div>
                  <h3>Looking for 1-on-1 In-App Therapy?</h3>
                  <p>
                    Join our early access care list to receive an alert as soon as verified psychologist booking slots open on Vistaraz.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<ArrowRight size={16} />}
                    fullWidth
                    onClick={handleJoinClinicianWaitlist}
                  >
                    Join Clinical Waitlist
                  </Button>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Link to="/safety" style={{ fontSize: '0.84rem', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} /> View All 24/7 Crisis Helplines →
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Modal: Resource Details & Waitlist */}
        {selectedResource && (
          <div className="vz-modal-backdrop" onClick={() => setSelectedResource(null)}>
            <div className="vz-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="vz-modal-close"
                onClick={() => setSelectedResource(null)}
              >
                <X size={20} />
              </button>

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
                  fontSize: '1.6rem'
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
                  <span>24 Hours · Free & Confidential</span>
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

        {/* Modal: Clinical Waitlist Confirmation */}
        {waitlistSuccess && (
          <div className="vz-modal-backdrop" onClick={() => setWaitlistSuccess(false)}>
            <div className="vz-modal-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '32px 24px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>You're on the Priority Care List</h3>
              <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
                We'll notify you via your registered email as soon as accredited in-app psychologist and counselor appointments become available in Phase 2.
              </p>
              <Button variant="primary" fullWidth onClick={() => setWaitlistSuccess(false)}>
                Got It
              </Button>
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
