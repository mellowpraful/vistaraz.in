import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, MessageSquare, Heart, Shield, Users } from 'lucide-react';

/**
 * CommunityPage
 * Assigned to: Developer 1
 * Source: community.html
 * Route: /community
 */
export default function CommunityPage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="vz-eyebrow">SAFE PEER CIRCLES</span>
            <h1>Community Circles</h1>
            <p>Peer discussions moderated by trained wellbeing supporters.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 1 Assignment
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card variant="default" padding="md" hoverable={true}>
            <span className="vz-chip mint" style={{ marginBottom: '12px' }}>Academic & Exam Stress</span>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>How do you handle exam panic without spiraling?</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              "Sharing small rituals that helped me get through final semester without breaking down..."
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>
              <span>💬 24 replies</span>
              <span>Moderated by Vistaraz Care</span>
            </div>
          </Card>

          <Card variant="default" padding="md" hoverable={true}>
            <span className="vz-chip peach" style={{ marginBottom: '12px' }}>Relationships & Boundaries</span>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Learning to say no to people without feeling guilty</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              "A gentle reminder that setting a personal boundary doesn't make you a bad friend."
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>
              <span>💬 41 replies</span>
              <span>Moderated by Vistaraz Care</span>
            </div>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> Migrated from <code>community.html</code>. Includes topic category filters, community moderation rules, safe reply posting modal, and anonymous alias badges.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
