import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  Mail,
  GraduationCap
} from 'lucide-react';
import './AboutPages.css';

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="vz-info-page-container">
        {/* Hero Section */}
        <section className="vz-info-hero">
          <span className="vz-eyebrow">OUR MISSION</span>
          <h1 className="vz-info-hero__title">
            Mental wellbeing made <em className="vz-text-violet">human, safe, &amp; accessible.</em>
          </h1>
          <p className="vz-info-hero__desc">
            Vistaraz was founded on a simple truth: growing up in today's high-pressure environment is challenging,
            and reaching out for help should never feel intimidating, stigmatizing, or unaffordable.
          </p>
        </section>

        {/* Pillars */}
        <div className="vz-about-pillars-grid">
          <Card variant="default" padding="lg" className="vz-pillar-card">
            <div className="vz-pillar-icon" style={{ backgroundColor: '#ede9fe', color: 'var(--vz-primary)' }}>
              <Heart size={24} />
            </div>
            <h3>Empathetic &amp; Youth-Centered</h3>
            <p>
              We specifically cater to youth and university students aged 15–25 across India navigating academic stress,
              identity shifts, placement anxiety, relationships, and loneliness.
            </p>
          </Card>

          <Card variant="default" padding="lg" className="vz-pillar-card">
            <div className="vz-pillar-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Strict Privacy &amp; Anonymity</h3>
            <p>
              You never need to reveal your real identity to talk to peers. Our nickname-first architecture and zero-storage
              safeguards ensure your vulnerability remains completely protected.
            </p>
          </Card>

          <Card variant="default" padding="lg" className="vz-pillar-card">
            <div className="vz-pillar-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Compass size={24} />
            </div>
            <h3>Evidence-Based &amp; Ethical</h3>
            <p>
              We do not fake clinical appointments or replace medical doctors with automated chatbots. We bridge self-help tools,
              trained peer support, and verified professional healthcare honestly.
            </p>
          </Card>
        </div>

        {/* Origin & Commitment */}
        <section className="vz-about-story-section">
          <Card variant="default" padding="xl">
            <span className="vz-eyebrow">THE VISTARAZ ETHOS</span>
            <h2>Innovate · Heal · Impact</h2>
            <p>
              Mental health support should meet you wherever you are. Whether that is needing a 60-second breathing exercise
              during a late-night panic attack, reading comforting words in an anonymous community circle, or finding the courage
              to call a licensed professional helpline — Vistaraz is your companion.
            </p>
            <p style={{ marginTop: '12px' }}>
              During our <strong>Free Community Beta</strong>, we are committed to keeping core emotional self-regulation
              tools and peer community spaces 100% free for everyone.
            </p>
          </Card>
        </section>

        {/* Contact info */}
        <div className="vz-about-contact-box">
          <Mail size={24} color="var(--vz-primary)" />
          <div>
            <strong>Questions, feedback, or institutional partnerships?</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--vz-text-secondary)', fontSize: '0.92rem' }}>
              Email our founding team directly at{' '}
              <a href="mailto:vistaraz26@gmail.com" style={{ color: 'var(--vz-primary)', fontWeight: 600 }}>
                vistaraz26@gmail.com
              </a>. We reply to every message.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
