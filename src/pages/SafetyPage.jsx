import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Phone, ShieldAlert, AlertTriangle, ArrowRight, Heart } from 'lucide-react';
import './SafetyPage.css';

/**
 * SafetyPage
 * Assigned to: Developer 2
 * Source: safety.html
 * Route: /safety
 *
 * Urgent crisis resources & helpline directory with one-touch emergency call links.
 */

const HELPLINES = [
  {
    id: 'kiran',
    name: 'KIRAN — National Mental Health Helpline',
    number: '1800-599-0019',
    displayNumber: '1800-599-0019',
    timing: '24/7 · Free & Confidential · Government of India',
    color: 'pink',
    icon: '🧠',
  },
  {
    id: 'tele-manas',
    name: 'Tele-MANAS',
    number: '14416',
    displayNumber: '14416 / 1800-891-4416',
    timing: '24/7 · Free Government Mental Health Service',
    color: 'pink',
    icon: '📞',
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation',
    number: '+919999666555',
    displayNumber: '+91 9999 666 555',
    timing: '24/7 · Crisis Counseling · Multilingual',
    color: 'peach',
    icon: '💙',
  },
  {
    id: 'aasra',
    name: 'AASRA — Suicide Prevention',
    number: '+919820466726',
    displayNumber: '+91 98204 66726',
    timing: '24/7 · Suicide Prevention & Crisis Intervention',
    color: 'peach',
    icon: '🌿',
  },
  {
    id: 'nimhans',
    name: 'NIMHANS Psychosocial Helpline',
    number: '08046110007',
    displayNumber: '080-46110007',
    timing: 'Psychosocial Support · Bangalore',
    color: 'sky',
    icon: '🏥',
  },
];

const FIRST_SENTENCES = [
  { text: '"I don\'t feel safe being alone right now."', color: 'var(--vz-primary)' },
  { text: '"I\'m worried I might hurt myself."', color: 'var(--vz-pastel-peach-icon)' },
  { text: '"Can you stay with me while we get help?"', color: 'var(--vz-pastel-mint-icon)' },
];

export default function SafetyPage() {
  const [calledId, setCalledId] = useState(null);

  return (
    <AppLayout>
      <div className="safety-page">
        {/* Hero Section */}
        <section className="safety-hero">
          <div className="safety-hero__badge">
            <ShieldAlert size={16} />
            <span>WHEN IT CAN'T WAIT</span>
          </div>
          <h1 className="safety-hero__title">
            Your safety comes <em className="safety-hero__em">first.</em>
          </h1>
          <p className="safety-hero__desc">
            Vistaraz is <strong>not</strong> an emergency service. If you or someone near you is in
            immediate danger, please contact professional emergency services now.
          </p>
        </section>

        <div className="safety-grid">
          {/* Emergency Card */}
          <Card variant="default" padding="lg" className="safety-emergency-card">
            <div className="safety-emergency-card__icon-row">
              <span className="safety-emergency-icon">🚨</span>
            </div>
            <h2 className="safety-emergency-card__title">Reach local emergency help now.</h2>
            <p className="safety-emergency-card__body">
              If you or someone else may be in immediate danger, contact the emergency service in
              your location (e.g. <strong>112</strong> in India) or go to the nearest emergency
              department. If possible, tell a trusted person near you.
            </p>
            <a
              href="tel:112"
              className="safety-emergency-btn"
              aria-label="Call emergency services — 112"
            >
              <Phone size={18} />
              Call Emergency Services — 112
            </a>
          </Card>

          {/* First Sentences Card */}
          <Card variant="default" padding="lg" className="safety-sentences-card">
            <h2 className="safety-sentences-card__title">Use a simple first sentence.</h2>
            <p className="safety-sentences-card__body">
              You don't have to explain everything perfectly. Try saying:
            </p>
            {FIRST_SENTENCES.map((s, idx) => (
              <div
                key={idx}
                className="safety-quote"
                style={{ borderLeftColor: s.color }}
              >
                {s.text}
              </div>
            ))}
          </Card>

          {/* Helpline Cards */}
          <div className="safety-helplines">
            <div className="safety-helplines__header">
              <span className="safety-eyebrow">24/7 CRISIS HELPLINES — INDIA</span>
              <h2>One-touch call support</h2>
              <p>These helplines are free, confidential, and staffed 24 hours a day.</p>
            </div>

            {HELPLINES.map((h) => (
              <Card
                key={h.id}
                variant={h.color}
                padding="md"
                className={`safety-helpline-row ${calledId === h.id ? 'safety-helpline-row--called' : ''}`}
              >
                <div className="safety-helpline-info">
                  <span className="safety-helpline-icon" aria-hidden="true">{h.icon}</span>
                  <div>
                    <h3 className="safety-helpline-name">{h.name}</h3>
                    <p className="safety-helpline-timing">{h.timing}</p>
                  </div>
                </div>
                <a
                  href={`tel:${h.number}`}
                  className="safety-call-btn"
                  aria-label={`Call ${h.name} at ${h.displayNumber}`}
                  onClick={() => setCalledId(h.id)}
                >
                  <Phone size={15} />
                  <span>{h.displayNumber}</span>
                </a>
              </Card>
            ))}
          </div>

          {/* Protocol Card — full width */}
          <Card variant="default" padding="lg" className="safety-protocol-card">
            <span className="safety-eyebrow">HOW VISTARAZ RESPONDS</span>
            <h2 className="safety-protocol-card__title">Clear escalation, not false reassurance.</h2>
            <p className="safety-protocol-card__body">
              In the production platform, high-risk messages trigger trained review,
              region-appropriate urgent-resource guidance, and qualified escalation pathways.
              Users under 18 require additional consent and safeguarding flows. No community
              post, AI response, student, intern, or peer supporter will ever present itself as
              emergency or clinical care.
            </p>
            <div className="safety-protocol-actions">
              <Button to="/support" variant="outline" icon={<ArrowRight size={16} />}>
                Return to Support Options
              </Button>
              <Button to="/tools" variant="ghost" icon={<Heart size={16} />} iconPosition="left">
                Calming Tools
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
