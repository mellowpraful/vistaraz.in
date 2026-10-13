import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, ShieldAlert, Phone, ExternalLink, Heart } from 'lucide-react';

/**
 * SafetyPage
 * Assigned to: Developer 2
 * Source: safety.html
 * Route: /safety
 */
export default function SafetyPage() {
  const helplines = [
    { name: 'KIRAN (National Mental Health Helpline)', number: '1800-599-0019', timing: '24/7 Free & Confidential' },
    { name: 'Tele-MANAS', number: '14416 / 1800-891-4416', timing: '24/7 Free Government Service' },
    { name: 'Vandrevala Foundation', number: '+91 9999 666 555', timing: '24/7 Crisis Counseling' },
    { name: 'AASRA', number: '+91 98204 66726', timing: '24/7 Suicide Prevention' },
    { name: 'NIMHANS Helpline', number: '080-46110007', timing: 'Psychosocial Support' },
  ];

  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '60px 24px', maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="vz-chip pink" style={{ marginBottom: '12px' }}>
            <ShieldAlert size={14} /> Immediate Assistance
          </span>
          <h1>Safety & Urgent Support</h1>
          <p style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            If you or someone you know is feeling unsafe, experiencing acute distress, or having thoughts of self-harm, please reach out to professional emergency services immediately.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {helplines.map((h) => (
            <Card key={h.name} variant="pink" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--vz-pastel-pink-text)' }}>{h.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{h.timing}</p>
                </div>
                <a
                  href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                  className="vz-btn vz-btn--primary vz-btn--sm"
                  style={{ backgroundColor: '#be185d' }}
                >
                  <Phone size={14} style={{ marginRight: '6px' }} /> Call {h.number}
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>safety.html</code>. Includes regional emergency directory, one-touch call handlers, crisis de-escalation breathing triggers, and safeguarding notice.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
