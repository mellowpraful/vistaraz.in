import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Compass,
  Shield,
  Activity,
  Users,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Wind
} from 'lucide-react';
import './AboutPages.css';

const STEPS = [
  {
    step: '01',
    icon: Compass,
    title: 'Understand Yourself',
    desc: 'Begin with quiet, self-paced reflection. Take an evidence-based wellbeing check-in or daily mood check to map what feels heavy without any pressure.',
    highlight: 'No test scores or diagnosis labels — just honest clarity on your anxiety, sleep, and energy levels.',
  },
  {
    step: '02',
    icon: Lock,
    title: 'Choose Privacy & Anonymity',
    desc: 'You choose an anonymous animal avatar and alias. Your real identity, college, and phone number are never shared during peer sessions or community circles.',
    highlight: 'Nickname-first safeguarding protects your dignity and privacy completely.',
  },
  {
    step: '03',
    icon: Wind,
    title: 'Self-Regulate with Somatic Tools',
    desc: 'Explore the Sanctuary Tools anytime for immediate grounding: guided Box Breathing, 4-7-8 sleep rhythm, rapid vagus nerve reset, procedural soundscapes, and the Worry Shredder.',
    highlight: 'Evidence-based somatic exercises to interrupt acute spiral or panic in 60 seconds.',
  },
  {
    step: '04',
    icon: Users,
    title: 'Connect with Compassionate Humans',
    desc: 'Join moderated Community Circles to ask questions and share feelings anonymously. When you need someone to talk to, trained peer listeners offer empathetic, non-judgmental presence.',
    highlight: 'Safe peer support where you are heard and recognized without unsolicited advice.',
  },
  {
    step: '05',
    icon: HeartHandshake,
    title: 'Professional Care When Needed',
    desc: 'For deeper clinical therapy or persistent depression, Vistaraz connects you to accredited counselors, clinical psychologists, and 24/7 verified national helplines like Tele-MANAS.',
    highlight: 'Zero simulated therapy. Honest, transparent bridges to certified mental healthcare practitioners.',
  },
];

export default function HowItWorksPage() {
  return (
    <AppLayout>
      <div className="vz-info-page-container">
        {/* Hero Section */}
        <section className="vz-info-hero">
          <span className="vz-eyebrow">THE VISTARAZ JOURNEY</span>
          <h1 className="vz-info-hero__title">
            How Vistaraz supports your <em className="vz-text-violet">mental wellbeing.</em>
          </h1>
          <p className="vz-info-hero__desc">
            Vistaraz is not just another meditation app or AI bot. It is an end-to-end youth sanctuary designed to help you
            pause, regulate your nervous system, connect with kind humans, and access verified clinical care when you need it.
          </p>
        </section>

        {/* 5-Step Process */}
        <div className="vz-steps-grid">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.step} variant="default" padding="lg" className="vz-step-card">
                <div className="vz-step-card__top">
                  <span className="vz-step-number">{s.step}</span>
                  <div className="vz-step-icon-wrap">
                    <Icon size={22} />
                  </div>
                </div>
                <h3 className="vz-step-title">{s.title}</h3>
                <p className="vz-step-desc">{s.desc}</p>
                <div className="vz-step-highlight">
                  <CheckCircle2 size={16} className="vz-step-check" />
                  <span>{s.highlight}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="vz-info-cta-box">
          <Sparkles size={28} color="var(--vz-primary)" />
          <h2>Ready to take your first gentle step?</h2>
          <p>
            Start with our interactive wellbeing check-in or explore our grounding tools. Everything is 100% free during the open beta.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <Button to="/assessment" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
              Take Wellbeing Check-in
            </Button>
            <Button to="/tools" variant="outline" size="lg">
              Explore Grounding Tools
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
