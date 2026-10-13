import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * RulesPage
 * Assigned to: Developer 2
 * Source: rules.html
 * Route: /rules
 */
export default function RulesPage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '60px 24px', maxWidth: '860px' }}>
        <div style={{ marginBottom: '36px' }}>
          <span className="vz-chip lavender" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} /> Developer 2 Assignment
          </span>
          <h1>Terms, Conditions & Sanctuary Rules</h1>
          <p style={{ marginTop: '8px' }}>
            Guidelines governing respectful participation, listener boundaries, and platform safety.
          </p>
        </div>

        <Card variant="peach" padding="md" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="var(--vz-pastel-peach-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--vz-pastel-peach-text)' }}>Guidance & Disclaimer Notice</strong>
              <p style={{ fontSize: '0.88rem', color: '#7c2d12', marginTop: '4px' }}>
                Vistaraz is a peer guidance and wellbeing support platform. Peer listeners are trained empathic supporters, not licensed therapists or medical clinicians. Assessment tools do not provide psychiatric diagnosis.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="lg" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Community Principles</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: 'var(--vz-text-secondary)' }}>
            <li><strong>Empathy & Non-Judgment:</strong> Treat every person's lived experience with dignity and kindness.</li>
            <li><strong>Anonymity & Privacy:</strong> Never request or disclose real-world identifiers, phone numbers, or social handles.</li>
            <li><strong>Zero Tolerance for Harassment:</strong> Bullying, abusive speech, hate conduct, or exploitation leads to instant ban.</li>
            <li><strong>Boundary Respect:</strong> Listeners maintain supportive boundaries and do not engage in romantic or external relationships.</li>
          </ul>
        </Card>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>rules.html</code>. Includes 12 legal clauses, table of contents sidebar navigation, print styling, and policy versioning.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
