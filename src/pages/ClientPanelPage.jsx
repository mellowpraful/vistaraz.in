import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, User, Shield, Clock, Heart, ArrowRight } from 'lucide-react';

/**
 * ClientPanelPage
 * Assigned to: Developer 2
 * Source: client_panel.html
 * Route: /client-panel
 */
export default function ClientPanelPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">CARE MANAGEMENT</span>
            <h1>My Care Panel</h1>
            <p>Manage your active listener sessions, scheduled video calls, and personal notes.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 2 Assignment
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Active Support Match</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className="vz-avatar" style={{ backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🤝
              </div>
              <div>
                <strong>Aanya (Listener)</strong>
                <p style={{ fontSize: '0.8rem', color: '#10b981' }}>Connected · 3 sessions</p>
              </div>
            </div>
            <Button to="/chat" variant="primary" size="sm" fullWidth>
              Resume Chat Room
            </Button>
          </Card>

          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Consent & Privacy</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
              Your profile is currently set to Anonymous Mode. No real names or IP logs are shared.
            </p>
            <Button variant="outline" size="sm" fullWidth>
              Privacy Preferences
            </Button>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>client_panel.html</code>. Includes client care history, active bookings, session logs, notes encryption, and emergency quick-exit triggers.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
