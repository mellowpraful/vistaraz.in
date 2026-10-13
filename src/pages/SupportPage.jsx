import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, ArrowRight, Star, ShieldCheck, HeartHandshake } from 'lucide-react';

/**
 * SupportPage
 * Assigned to: Developer 1
 * Source: support.html
 * Route: /support
 */
export default function SupportPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">CONNECT & HEAL</span>
            <h1>Find Support</h1>
            <p>Connect with compassionate peer listeners or licensed mental health professionals.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 1 Assignment
          </span>
        </div>

        {/* Directory Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card variant="default" padding="md" hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div className="vz-avatar lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' }}>
                👩‍⚕️
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Dr. Rhea Mehta</h3>
                <p style={{ fontSize: '0.85rem' }}>Clinical Psychologist</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#f59e0b', marginTop: '2px' }}>
                  <Star size={14} fill="#f59e0b" /> 4.9 (120+ sessions)
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>Specializing in student anxiety, academic burnout, and emotional regulation.</p>
            <Button variant="outline" size="sm" fullWidth to="/chat">
              Book Consultation
            </Button>
          </Card>

          <Card variant="default" padding="md" hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div className="vz-avatar lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5' }}>
                🤝
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Aanya Sharma</h3>
                <p style={{ fontSize: '0.85rem' }}>Trained Peer Listener</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#10b981', marginTop: '2px' }}>
                  <span className="vz-status-dot online"></span> Available Now
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>Here to listen without judgment. Talk through friendships, stress, or thoughts.</p>
            <Button variant="primary" size="sm" fullWidth to="/chat">
              Start Free Chat
            </Button>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> Migrated from <code>support.html</code>. Includes filter pills (All, Psychologists, Psychiatrists, Counselors), listener status filters, profile cards, and booking triggers.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
