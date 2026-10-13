import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
    id: 'aanya',
    name: 'Aanya R.',
    role: 'Verified Listener',
    roleTag: 'Peer Listener',
    languages: ['English', 'Hindi'],
    topics: ['Academic Stress', 'Placements', 'Self-Doubt'],
    bio: 'Warm, structured conversations for when college pressure and deadlines are crowding everything else.',
    rating: 4.9,
    sessionsCount: 142,
    available: true,
    avatar: '👩‍🎓',
    type: 'listener',
  },
  {
    id: 'kunal',
    name: 'Kunal S.',
    role: 'Peer Supporter',
    roleTag: 'Peer Listener',
    languages: ['Hindi', 'English'],
    topics: ['Connection', 'Loneliness', 'Transitions'],
    bio: 'A gentle, practical space for loneliness, changing cities, and navigating difficult family conversations.',
    rating: 4.8,
    sessionsCount: 98,
    available: true,
    avatar: '👨‍🎓',
    type: 'listener',
  },
  {
    id: 'meera',
    name: 'Meera P.',
    role: 'Supervised Trainee',
    roleTag: 'Peer Listener',
    languages: ['English'],
    topics: ['Overthinking', 'Anxiety', 'Sleep'],
    bio: 'Calm support for repetitive overthinking and the late-night moments when a worrying thought won’t let go.',
    rating: 4.9,
    sessionsCount: 76,
    available: false,
    avatar: '🌿',
    type: 'listener',
  },
];

const PROFESSIONALS = [
  {
    id: 'rhea',
    name: 'Dr. Rhea Mehta',
    title: 'Clinical Psychologist',
    spec: 'M.Phil, Ph.D. Clinical Psychology',
    rating: 4.8,
    experience: '8+ yrs exp',
    languages: ['English', 'Hindi'],
    specialties: ['CBT', 'Anxiety Disorders', 'Student Burnout'],
    bio: 'Evidence-based cognitive therapy tailored for university students and young working professionals.',
    avatar: 'https://images.unsplash.com/photo-1594824813593-37599c1d1a64?auto=format&fit=crop&w=300&q=80',
    type: 'psychologist',
  },
  {
    id: 'arjun',
    name: 'Dr. Arjun Singh',
    title: 'Licensed Counselor',
    spec: 'M.A. Applied Psychology, Certified Counselor',
    rating: 4.7,
    experience: '6+ yrs exp',
    languages: ['English', 'Punjabi', 'Hindi'],
    specialties: ['Relationship Dynamics', 'Family Stress', 'Identity'],
    bio: 'Compassionate narrative therapy helping young people navigate identity, emotional regulation, and boundaries.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    type: 'counselor',
  },
  {
    id: 'neha',
    name: 'Dr. Neha Kapoor',
    title: 'Consultant Psychiatrist',
    spec: 'MD Psychiatry',
    rating: 4.9,
    experience: '11+ yrs exp',
    languages: ['English', 'Hindi'],
    specialties: ['Depressive Episodes', 'Severe Anxiety', 'ADHD Guidance'],
    bio: 'Holistic clinical evaluation and medication reviews paired with supportive medical psychoeducation.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    type: 'psychiatrist',
  },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'listeners', 'psychologists', 'psychiatrists', 'counselors'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filterTabs = [
    { id: 'all', label: 'All Support' },
    { id: 'listeners', label: 'Peer Listeners' },
    { id: 'psychologists', label: 'Psychologists' },
    { id: 'psychiatrists', label: 'Psychiatrists' },
    { id: 'counselors', label: 'Counselors' },
  ];

  const filteredProfessionals = PROFESSIONALS.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'psychologists') return p.type === 'psychologist';
    if (activeTab === 'psychiatrists') return p.type === 'psychiatrist';
    if (activeTab === 'counselors') return p.type === 'counselor';
    return false;
  });

  const showListeners = activeTab === 'all' || activeTab === 'listeners';
  const showPros = activeTab !== 'listeners';

  return (
    <AppLayout hasSidebar={true}>
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

        {/* Level 01: Chat Listeners */}
        {showListeners && (
          <section className="vz-support-section">
            <div className="vz-support-section__title-row">
              <div>
                <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
                  LEVEL 01 · CHAT SUPPORT
                </span>
                <h2>Start with someone who listens.</h2>
              </div>
              <span className="vz-chip mint">
                First conversation is 100% free
              </span>
            </div>

            <div className="vz-support-grid-3">
              {LISTENERS.map((listener) => (
                <Card key={listener.id} variant="default" padding="lg" hoverable={true} className="vz-listener-card">
                  <div className="vz-listener-card__header">
                    <div className="vz-listener-card__avatar">
                      {listener.avatar}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem' }}>{listener.name}</h3>
                      <div className="vz-listener-card__status">
                        {listener.available ? (
                          <>
                            <span className="vz-status-dot online"></span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Available Now</span>
                          </>
                        ) : (
                          <>
                            <span className="vz-status-dot busy"></span>
                            <span style={{ color: '#d97706', fontWeight: 600 }}>In Session</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="vz-listener-card__tags">
                    {listener.topics.map((t) => (
                      <span key={t} className="vz-chip sky">{t}</span>
                    ))}
                    <span className="vz-chip lavender">{listener.languages.join(', ')}</span>
                  </div>

                  <p className="vz-listener-card__bio">{listener.bio}</p>

                  <div className="vz-listener-card__footer">
                    <div style={{ fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>
                      ★ {listener.rating} ({listener.sessionsCount} chats)
                    </div>
                    <Button to="/chat" variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                      Start Free Chat
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Level 02 & 03: Professional Help matching reference image bottom right */}
        {showPros && (
          <section className="vz-support-section" style={{ marginTop: '48px' }}>
            <div className="vz-support-section__title-row">
              <div>
                <span className="vz-eyebrow" style={{ color: '#d97706' }}>
                  LEVEL 02 & 03 · SPECIALIZED PROFESSIONAL CARE
                </span>
                <h2>Professional Help When Needed</h2>
                <p style={{ marginTop: '4px', fontSize: '0.95rem', color: 'var(--vz-text-secondary)' }}>
                  When you need specialized clinical care, connect with qualified mental-health professionals.
                </p>
              </div>
            </div>

            <div className="vz-pros-layout">
              <div className="vz-pros-grid">
                {filteredProfessionals.map((pro) => (
                  <Card key={pro.id} variant="default" padding="lg" hoverable={true} className="vz-pro-card">
                    <div className="vz-pro-card__top">
                      <img src={pro.avatar} alt={pro.name} className="vz-pro-card__img" />
                      <div>
                        <h3 style={{ fontSize: '1.25rem' }}>{pro.name}</h3>
                        <p style={{ fontSize: '0.88rem', color: 'var(--vz-primary)', fontWeight: 600 }}>{pro.title}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--vz-text-muted)' }}>{pro.experience}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>
                          <Star size={14} fill="#f59e0b" /> {pro.rating} rating
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', margin: '14px 0', minHeight: '44px' }}>
                      {pro.bio}
                    </p>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {pro.specialties.map((s) => (
                        <span key={s} className="vz-chip mint">{s}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => setSelectedProfile(pro)}
                      >
                        View Profile & Book
                      </Button>
                      <Button to="/video-call" variant="outline" size="sm" icon={<Video size={14} />} title="Video Consultation" />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Guide Side Banner from reference image */}
              <div className="vz-pros-sidebar">
                <Card variant="lavender" padding="lg" className="vz-pro-guide-card">
                  <div className="vz-pro-guide-card__icon">
                    <Sparkles size={28} color="var(--vz-primary)" />
                  </div>
                  <h3>Not sure if you need professional help?</h3>
                  <p>
                    Talk to us or start with a non-diagnostic wellbeing assessment to explore your options.
                  </p>
                  <Button to="/assessment" variant="primary" size="md" icon={<ArrowRight size={16} />} fullWidth>
                    Take Check-in First
                  </Button>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Modal: Clinician Profile & Booking */}
        {selectedProfile && (
          <div className="vz-modal-backdrop" onClick={() => { setSelectedProfile(null); setBookingSuccess(false); }}>
            <div className="vz-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="vz-modal-close"
                onClick={() => { setSelectedProfile(null); setBookingSuccess(false); }}
              >
                <X size={20} />
              </button>

              {!bookingSuccess ? (
                <>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <img src={selectedProfile.avatar} alt={selectedProfile.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontSize: '1.4rem' }}>{selectedProfile.name}</h3>
                      <p style={{ color: 'var(--vz-primary)', fontWeight: 600 }}>{selectedProfile.title}</p>
                      <small style={{ color: 'var(--vz-text-muted)' }}>{selectedProfile.spec}</small>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                    {selectedProfile.bio}
                  </p>

                  <div style={{ backgroundColor: 'var(--vz-bg-subtle)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                      <strong>Available Slot:</strong>
                      <span>Tomorrow, 5:00 PM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <strong>Session Mode:</strong>
                      <span>Encrypted Video Call (45 mins)</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={<Calendar size={18} />}
                    onClick={() => setBookingSuccess(true)}
                  >
                    Confirm Consultation Booking
                  </Button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Session Confirmed!</h3>
                  <p style={{ color: 'var(--vz-text-secondary)', marginBottom: '24px' }}>
                    Your session with {selectedProfile.name} is booked for tomorrow at 5:00 PM. A calendar link has been placed in your Care Panel.
                  </p>
                  <Button to="/client-panel" variant="primary" fullWidth onClick={() => setSelectedProfile(null)}>
                    Go to My Care Panel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
