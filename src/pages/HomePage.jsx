import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Sparkles,
  ArrowRight,
  Play,
  User,
  MessageSquare,
  Users,
  ShieldCheck,
  Heart,
  Video,
  UserCheck,
  CheckCircle2,
  X,
  Wind
} from 'lucide-react';
import './HomePage.css';

/**
 * HomePage Component (Developer 1)
 * Migrated from index.html / index.original.html
 * Visual source of truth: Vistaraz reference image
 */
export default function HomePage() {
  const [showBreathModal, setShowBreathModal] = useState(false);

  const featureCards = [
    {
      title: 'Understand Yourself',
      desc: 'Quick & easy wellbeing assessment to know where you stand.',
      icon: User,
      link: '/assessment',
      chipClass: 'lavender',
      iconBg: '#ede9fe',
      iconColor: '#6d28d9',
    },
    {
      title: 'Get Support',
      desc: 'Explore personalized support options based on your needs.',
      icon: MessageSquare,
      link: '/support',
      chipClass: 'mint',
      iconBg: '#d1fae5',
      iconColor: '#059669',
    },
    {
      title: 'Connect with Real People',
      desc: 'Talk to trained listeners through chat, voice or video sessions.',
      icon: Users,
      link: '/support',
      chipClass: 'peach',
      iconBg: '#ffedd5',
      iconColor: '#d97706',
    },
    {
      title: 'Professional Help When Needed',
      desc: 'Guidance to qualified mental-health professionals when required.',
      icon: ShieldCheck,
      link: '/support',
      chipClass: 'pink',
      iconBg: '#fce7f3',
      iconColor: '#e11d48',
    },
  ];

  const lifeScenarios = [
    {
      title: 'College Pressure',
      img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=500&q=80',
      tag: 'Academics & Exams',
    },
    {
      title: 'Overthinking',
      img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=500&q=80',
      tag: 'Mind & Calming',
    },
    {
      title: 'Relationship Issues',
      img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=80',
      tag: 'Friends & Family',
    },
    {
      title: 'Feeling Alone',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80',
      tag: 'Loneliness',
    },
  ];

  return (
    <AppLayout>
      {/* 1. Top Announcement Bar */}
      <aside className="vz-home-announce" aria-label="Special Announcement">
        <div className="vz-container vz-home-announce__inner">
          <Sparkles size={16} className="vz-text-violet" />
          <span>
            <strong>New:</strong> Your first support conversation is on us.
          </span>
          <Link to="/register" className="vz-home-announce__link">
            Claim Free Session →
          </Link>
        </div>
      </aside>

      {/* 2. Hero Section matching reference image */}
      <section className="vz-home-hero">
        <div className="vz-container vz-home-hero__grid">
          <div className="vz-home-hero__copy">
            <span className="vz-eyebrow">A BETTER WAY TO REACH OUT</span>
            <h1 className="vz-home-hero__title">
              You don’t have to figure everything <span className="vz-text-violet">out alone.</span>
            </h1>
            <p className="vz-home-hero__desc">
              Understand what you're feeling, get the right support, connect with real people, and access professional help when needed — all in a safe, private and judgment-free space.
            </p>

            <div className="vz-home-hero__actions">
              <Button to="/register" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                Get Started
              </Button>
              <Button to="/assessment" variant="outline" size="lg" icon={<Play size={16} fill="currentColor" />} iconPosition="left">
                How it works
              </Button>
              <button
                type="button"
                className="vz-btn vz-btn--soft vz-btn--md"
                onClick={() => setShowBreathModal(true)}
                title="Take a quick breath"
              >
                <Wind size={16} style={{ marginRight: '6px' }} /> Quick Breath
              </button>
            </div>
          </div>

          <div className="vz-home-hero__visual">
            <div className="vz-home-hero__image-card">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80"
                alt="Young college friends smiling together outdoors in supportive environment"
                className="vz-home-hero__img"
                loading="eager"
              />
              <div className="vz-home-hero__trust-badge">
                <CheckCircle2 size={18} color="#10b981" />
                <span>100% Confidential · No Real Name Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Core Pillars / Feature Cards from reference */}
      <section className="vz-home-features">
        <div className="vz-container">
          <div className="vz-home-features__grid">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} variant="default" padding="md" hoverable={true} className="vz-home-feat-card">
                  <div
                    className="vz-home-feat-card__icon"
                    style={{ backgroundColor: feat.iconBg, color: feat.iconColor }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="vz-home-feat-card__title">{feat.title}</h3>
                  <p className="vz-home-feat-card__desc">{feat.desc}</p>
                  <Link to={feat.link} className="vz-home-feat-card__arrow" aria-label={`Learn more about ${feat.title}`}>
                    <ArrowRight size={18} />
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Cultural Resonance Banner (Ek Kachori, Do Samosa...) from reference */}
      <section className="vz-home-snack-section">
        <div className="vz-container">
          <div className="vz-home-snack-banner">
            <div className="vz-home-snack-banner__left">
              <img
                src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=360&q=80"
                alt="Warm samosas and chai snacks"
                className="vz-home-snack-img"
                loading="lazy"
              />
              <div className="vz-home-snack-text">
                <h2 className="vz-home-snack-title">
                  Ek kachori, do samosa...<br />
                  <span>Vistaraz par hai bharosa ♡</span>
                </h2>
                <p className="vz-home-snack-sub">
                  Because talking about how you feel should be as easy as sharing a snack with a friend.
                </p>
              </div>
            </div>
            <Link to="/community" className="vz-home-snack-btn" aria-label="Join Community Space">
              <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Built for Real Life and Real People (Context Scenarios) */}
      <section className="vz-home-scenarios">
        <div className="vz-container">
          <div className="vz-home-scenarios__header">
            <h2>Built for Real Life and Real People</h2>
            <p>
              Whether it's stress, overthinking, relationships, academic pressure or just a difficult day — Vistaraz is here to help you take the first step.
            </p>
          </div>

          <div className="vz-home-scenarios__grid">
            {lifeScenarios.map((item) => (
              <div key={item.title} className="vz-scenario-card">
                <div className="vz-scenario-card__media">
                  <img src={item.img} alt={item.title} loading="lazy" />
                  <span className="vz-scenario-card__tag">{item.tag}</span>
                </div>
                <h3 className="vz-scenario-card__title">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Original Section: "Start small. Go at your pace." (3-Step Adaptable Path) */}
      <section className="vz-home-steps">
        <div className="vz-container">
          <div className="vz-home-steps__header">
            <span className="vz-eyebrow">A PATH THAT ADAPTS TO YOU</span>
            <h2>Start small.<br /><em className="vz-text-violet">Go at your pace.</em></h2>
            <p>You decide what you need, and how visible you want to be. We make the next step feel lighter.</p>
          </div>

          <div className="vz-home-steps__grid">
            <Card variant="default" padding="lg" hoverable={true}>
              <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>01</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Check in</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                A simple, click-based reflection to help find a helpful next step. Not a psychiatric diagnosis.
              </p>
              <Link to="/assessment" className="vz-text-violet" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Take Check-in →
              </Link>
            </Card>

            <Card variant="default" padding="lg" hoverable={true}>
              <span className="vz-eyebrow" style={{ color: '#d97706' }}>02</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Choose identity</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                Use an anonymous avatar with others, or a private profile when professional care needs it.
              </p>
              <Link to="/register" className="vz-text-violet" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                View Options →
              </Link>
            </Card>

            <Card variant="default" padding="lg" hoverable={true}>
              <span className="vz-eyebrow" style={{ color: '#059669' }}>03</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Meet the right human</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                Start with a listener, move to a video call, or choose qualified professional care.
              </p>
              <Link to="/support" className="vz-text-violet" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Explore Support →
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Original Section: "The Support Ladder" */}
      <section className="vz-home-ladder">
        <div className="vz-container">
          <div className="vz-home-ladder__grid">
            <div className="vz-home-ladder__content">
              <span className="vz-eyebrow">THE SUPPORT LADDER</span>
              <h2>Human support,<br /><em className="vz-text-violet">at the right level.</em></h2>
              <p style={{ margin: '16px 0 24px' }}>
                Vistaraz is not an automated chatbot replacing empathy. It is a bridge to appropriate human support — without pretending every need requires the same answer.
              </p>

              <ul className="vz-home-ladder__list">
                <li>
                  <MessageSquare size={20} color="var(--vz-primary)" />
                  <div>
                    <strong>01 · Trained support listeners (Chat)</strong>
                    <p>Free, anonymous peer listening for college, exam, or friendship worries.</p>
                  </div>
                </li>
                <li>
                  <Video size={20} color="#0284c7" />
                  <div>
                    <strong>02 · Private voice or video support</strong>
                    <p>One-on-one encrypted tele-support from your room.</p>
                  </div>
                </li>
                <li>
                  <UserCheck size={20} color="#059669" />
                  <div>
                    <strong>03 · Verified qualified professionals</strong>
                    <p>Licensed clinical psychologists for structured psychotherapy.</p>
                  </div>
                </li>
              </ul>

              <div style={{ marginTop: '32px' }}>
                <Button to="/support" variant="primary" size="md" icon={<ArrowRight size={16} />}>
                  Explore support options
                </Button>
              </div>
            </div>

            <div className="vz-home-ladder__image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=640&q=75"
                alt="Person feeling relaxed, supported and peaceful"
                className="vz-home-ladder__img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Breathing Modal Interactive Micro-Feature */}
      {showBreathModal && (
        <div className="vz-modal-backdrop" onClick={() => setShowBreathModal(false)}>
          <div className="vz-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="vz-modal-close"
              onClick={() => setShowBreathModal(false)}
              aria-label="Close breath prompt"
            >
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div className="vz-breath-pulse-circle">
                <Wind size={36} color="var(--vz-primary)" />
              </div>
              <h3 style={{ marginTop: '16px', fontSize: '1.4rem' }}>Take a Soft Breath</h3>
              <p style={{ color: 'var(--vz-text-secondary)', margin: '8px auto 20px', maxWidth: '320px', fontSize: '0.95rem' }}>
                Inhale for 4 seconds... Hold gently for 4... Exhale slowly for 4. You don't have to carry everything right now.
              </p>
              <Button to="/tools" variant="primary" size="md" onClick={() => setShowBreathModal(false)}>
                Open Breathing Studio
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
