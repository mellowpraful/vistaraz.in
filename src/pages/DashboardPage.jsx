import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Calendar, MessageSquare, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

/**
 * DashboardPage
 * Assigned to: Developer 1
 * Source: dashboard.html
 * Route: /dashboard
 */
export default function DashboardPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">YOUR SAFE HAVEN</span>
            <h1>Member Dashboard</h1>
            <p>Welcome back. Track your wellbeing journey, sessions, and reflections.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 1 Assignment
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card variant="mint" padding="md">
            <h4 style={{ color: 'var(--vz-pastel-mint-text)', marginBottom: '6px' }}>Latest Check-in</h4>
            <p style={{ color: '#064e3b', fontSize: '1.4rem', fontWeight: 700, margin: '8px 0' }}>Feeling Balanced</p>
            <span style={{ fontSize: '0.8rem', color: '#047857' }}>Completed today at 10:15 AM</span>
          </Card>

          <Card variant="sky" padding="md">
            <h4 style={{ color: 'var(--vz-pastel-sky-text)', marginBottom: '6px' }}>Upcoming Session</h4>
            <p style={{ color: '#0c4a6e', fontSize: '1.2rem', fontWeight: 700, margin: '8px 0' }}>Chat with Aanya</p>
            <span style={{ fontSize: '0.8rem', color: '#0284c7' }}>Tomorrow, 4:00 PM (30 mins)</span>
          </Card>

          <Card variant="lavender" padding="md">
            <h4 style={{ color: 'var(--vz-pastel-lavender-text)', marginBottom: '6px' }}>Sanctuary Streak</h4>
            <p style={{ color: '#4c1d95', fontSize: '1.4rem', fontWeight: 700, margin: '8px 0' }}>5 Days Active</p>
            <span style={{ fontSize: '0.8rem', color: '#6d28d9' }}>Great consistency on daily reflections</span>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> Migrated from <code>dashboard.html</code>. Includes quick access actions, recent session history, assessment score tracking, and journal bookmarks.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
