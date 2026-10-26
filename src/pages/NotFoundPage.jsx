import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ArrowLeft, Home, HeartHandshake, Sparkles, Compass } from 'lucide-react';
import './NotFoundPage.css';

/**
 * NotFoundPage
 * Assigned to: Developer 2
 * Source: 404.html
 * Route: * (catch-all)
 *
 * Friendly 404 sanctuary page with navigation shortcuts.
 */
const NAV_CARDS = [
  {
    to: '/assessment',
    icon: '💓',
    label: 'Self Check-in',
    desc: 'Evaluate your mood, stress, and anxiety in safe privacy.',
    accent: 'var(--vz-primary)',
  },
  {
    to: '/support',
    icon: '🤝',
    label: 'Support & Circles',
    desc: 'Connect with compassionate listeners and peer support circles.',
    accent: 'var(--vz-pastel-lavender-icon)',
  },
  {
    to: '/tools',
    icon: '🌿',
    label: 'Wellness Toolkit',
    desc: 'Guided breathing, grounding exercises, and mindfulness logs.',
    accent: 'var(--vz-pastel-mint-icon)',
  },
  {
    to: '/safety',
    icon: '🛡️',
    label: 'Urgent Safety',
    desc: '24/7 verified crisis lines, emergency contacts, and rapid support.',
    accent: 'var(--vz-pastel-pink-icon)',
    urgent: true,
  },
];

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="nf-page">
        {/* Hero */}
        <section className="nf-hero">
          <div className="nf-hero__icon-wrap" aria-hidden="true">
            <Compass size={38} strokeWidth={1.5} className="nf-hero__icon" />
          </div>
          <span className="nf-eyebrow">ERROR 404 · PATH NOT FOUND</span>
          <h1 className="nf-hero__title">
            This path has found <br />
            <em className="nf-hero__em">quiet peace.</em>
          </h1>
          <p className="nf-hero__desc">
            The page you are looking for may have been moved, renamed, or is taking a restorative
            rest. Let's guide you back to your sanctuary.
          </p>

          {/* Action Buttons */}
          <div className="nf-hero__actions">
            <button
              type="button"
              className="nf-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Button to="/" variant="primary" icon={<Home size={16} />} iconPosition="left">
              Return to Sanctuary
            </Button>
          </div>
        </section>

        {/* Navigation Cards */}
        <div className="nf-cards-grid">
          {NAV_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`nf-nav-card ${card.urgent ? 'nf-nav-card--urgent' : ''}`}
              aria-label={`Navigate to ${card.label}`}
            >
              <span className="nf-nav-card__icon" aria-hidden="true">{card.icon}</span>
              <h4 className="nf-nav-card__label">{card.label}</h4>
              <p className="nf-nav-card__desc">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
