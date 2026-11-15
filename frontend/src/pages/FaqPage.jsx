import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ChevronDown, ChevronUp, HelpCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import './AboutPages.css';

const FAQS = [
  {
    q: 'Is Vistaraz really free to use?',
    a: 'Yes. During our open Free Community Beta, all wellbeing self-regulation tools (Breathing Sanctuary, Worry Shredder, Sensory Grounding, Soundscapes), evidence-based assessments, and anonymous community circles are 100% free with zero payments or credit cards required.',
  },
  {
    q: 'Will other people or my college know my real name?',
    a: 'No. When you participate in Community Circles or speak with peer listeners, your real name, email, and phone number are never visible. You interact exclusively through your chosen anonymous avatar and nickname alias.',
  },
  {
    q: 'Are peer listeners licensed doctors or psychiatrists?',
    a: 'No. Peer listeners are empathetic, trained volunteers and psychology students who provide active listening, emotional validation, and a gentle presence. They do not diagnose conditions or prescribe medications. For clinical therapy, we connect you to verified national services like Tele-MANAS and accredited counselors.',
  },
  {
    q: 'What should I do if I am in an active crisis or emergency?',
    a: 'Vistaraz is designed for mild-to-moderate emotional stress and non-crisis grounding. If you are experiencing suicidal thoughts, self-harm impulses, or severe panic, please call 24/7 national emergency lines immediately: Tele-MANAS at 14416, KIRAN at 1800-599-0019, or Emergency at 112.',
  },
  {
    q: 'How does the Worry Shredder work?',
    a: 'The Worry Shredder is a cognitive defusion exercise. You type in a racing, distressing, or intrusive thought, select a defusion focus, and watch it visually shred and vanish. It helps remind your nervous system that thoughts are mental events, not permanent commands.',
  },
  {
    q: 'How can I become a verified peer listener or intern?',
    a: 'You can apply by registering with the "Helper" role or visiting /register?role=helper. After completing our background submission and code of ethics agreement, our clinical team will review your profile for verification.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <AppLayout>
      <div className="vz-info-page-container">
        <section className="vz-info-hero">
          <span className="vz-eyebrow">COMMON QUESTIONS</span>
          <h1 className="vz-info-hero__title">
            Frequently Asked <em className="vz-text-violet">Questions.</em>
          </h1>
          <p className="vz-info-hero__desc">
            Everything you need to know about our privacy standards, self-regulation tools, peer network, and beta launch.
          </p>
        </section>

        <div className="vz-faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card
                key={faq.q}
                variant="default"
                padding="md"
                className={`vz-faq-card ${isOpen ? 'open' : ''}`}
                onClick={() => toggleFaq(idx)}
                style={{ cursor: 'pointer', marginBottom: '14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--vz-text-primary)' }}>
                    {faq.q}
                  </h3>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vz-primary)' }}
                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                  >
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                {isOpen && (
                  <p style={{ marginTop: '12px', fontSize: '0.94rem', color: 'var(--vz-text-secondary)', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        <div className="vz-info-cta-box" style={{ marginTop: '48px' }}>
          <HelpCircle size={28} color="var(--vz-primary)" />
          <h2>Still have a question?</h2>
          <p>
            We are always here to help. Reach out to our support team directly.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <Button to="/contact" variant="primary" size="md">
              Contact Us
            </Button>
            <Button to="/tools" variant="outline" size="md">
              Try Wellbeing Tools
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
