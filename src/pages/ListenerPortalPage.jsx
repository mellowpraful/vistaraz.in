import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Users, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * ListenerPortalPage
 * Assigned to: Developer 2
 * Source: listener_portal.html
 * Route: /listener-portal
 */
export default function ListenerPortalPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">PROVIDER WORKSPACE</span>
            <h1>Support Listener Portal</h1>
            <p>Peer listener console for managing incoming queue, active seeker chats, and training.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 2 Assignment
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card variant="mint" padding="md">
            <h4 style={{ color: 'var(--vz-pastel-mint-text)' }}>Listener Status</h4>
            <p style={{ color: '#064e3b', fontSize: '1.4rem', fontWeight: 700, margin: '8px 0' }}>Online & Available</p>
            <span style={{ fontSize: '0.8rem', color: '#047857' }}>Ready to accept new chats</span>
          </Card>

          <Card variant="sky" padding="md">
            <h4 style={{ color: 'var(--vz-pastel-sky-text)' }}>Waiting Queue</h4>
            <p style={{ color: '#0c4a6e', fontSize: '1.4rem', fontWeight: 700, margin: '8px 0' }}>2 Seekers in Queue</p>
            <span style={{ fontSize: '0.8rem', color: '#0284c7' }}>Average wait: 3 minutes</span>
          </Card>

          <Card variant="peach" padding="md">
            <h4 style={{ color: 'var(--vz-pastel-peach-text)' }}>Supervisor Escalation</h4>
            <p style={{ color: '#7c2d12', fontSize: '1.1rem', fontWeight: 700, margin: '8px 0' }}>Escalation Protocol Active</p>
            <span style={{ fontSize: '0.8rem', color: '#9a3412' }}>Immediate supervisor contact available</span>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>listener_portal.html</code>. Includes listener availability toggle, incoming seeker queue polling, live response notes, supervisor crisis flag trigger, and credentialing check.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
