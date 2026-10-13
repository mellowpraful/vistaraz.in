import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Check, ArrowRight, Shield } from 'lucide-react';

/**
 * PlansPage
 * Assigned to: Developer 1
 * Source: plans.html
 * Route: /plans
 */
export default function PlansPage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '60px 24px', maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="vz-eyebrow">TRANSPARENT & ACCESSIBLE</span>
          <h1>Care Plans & Memberships</h1>
          <p style={{ maxWidth: '600px', margin: '12px auto 0' }}>
            We believe mental wellbeing support should be accessible to every student and youth. First conversation is always free.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <Card variant="default" padding="lg">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Free Peer Sanctuary</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-muted)', marginBottom: '16px' }}>For anyone needing a listening ear</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>₹0 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--vz-text-muted)' }}>/ forever</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>✓ Free initial support session</li>
              <li>✓ Interactive wellbeing toolkit</li>
              <li>✓ Moderated community circles</li>
              <li>✓ Self-reflection journal</li>
            </ul>
            <Button variant="outline" fullWidth to="/register">
              Get Started Free
            </Button>
          </Card>

          <Card variant="default" padding="lg" selected={true}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>Care Membership</h3>
              <span className="vz-chip lavender">Recommended</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-muted)', marginBottom: '16px' }}>Ongoing personalized care & priority</p>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>₹499 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--vz-text-muted)' }}>/ month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>✓ Unlimited peer listener chat sessions</li>
              <li>✓ 2 Voice / Video calls per month</li>
              <li>✓ Priority listener availability</li>
              <li>✓ Discounted therapist consultations</li>
            </ul>
            <Button variant="accent" fullWidth to="/register">
              Subscribe to Care
            </Button>
          </Card>
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> Migrated from <code>plans.html</code>. Includes plan comparison matrix, student institutional sponsorship options, FAQ accordion, and checkout trigger.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
