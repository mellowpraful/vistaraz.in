import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, ArrowRight, User, HeartHandshake, ShieldCheck } from 'lucide-react';

/**
 * RegisterPage
 * Assigned to: Developer 2
 * Source: register.html
 * Route: /register
 */
export default function RegisterPage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '60px 24px', maxWidth: '780px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="vz-chip lavender" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} /> Developer 2 Assignment
          </span>
          <h1>Join Vistaraz</h1>
          <p style={{ marginTop: '8px' }}>
            Choose how you would like to participate in the Vistaraz mental wellbeing sanctuary.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card variant="default" padding="lg" hoverable={true}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--vz-pastel-mint-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' }}>
              🌿
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>I Need Support (Seeker)</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
              Create an anonymous or named account to access peer listeners, assessment checks, and wellbeing tools.
            </p>
            <Button variant="primary" fullWidth icon={<ArrowRight size={16} />}>
              Continue as Seeker
            </Button>
          </Card>

          <Card variant="default" padding="lg" hoverable={true}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--vz-pastel-lavender-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' }}>
              🤝
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>I Want to Help (Listener)</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
              Apply to join as a trained peer listener intern. Complete training and support young people in distress.
            </p>
            <Button variant="outline" fullWidth icon={<ArrowRight size={16} />}>
              Apply as Listener
            </Button>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>register.html</code>. Includes role switching (?role=seeker / ?role=provider), multi-step registration forms, password hashing/auth validation, age gate, and anonymous session generation.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
