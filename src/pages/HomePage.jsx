import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowRight, Sparkles, CheckCircle, HeartHandshake } from 'lucide-react';

/**
 * HomePage
 * Assigned to: Developer 1
 * Source: index.html
 * Route: /
 */
export default function HomePage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '60px 24px' }}>
        {/* Foundation Hero Preview */}
        <section style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
          <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
            A BETTER WAY TO REACH OUT
          </span>
          <h1 style={{ marginBottom: '20px' }}>
            You don't have to figure everything <span className="vz-text-violet">out alone.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '32px' }}>
            Understand what you're feeling, get the right support, connect with real people, and access professional help when needed — all in a safe, private and judgment-free space.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button to="/register" variant="primary" size="lg" icon={<ArrowRight size={18} />}>
              Get Started
            </Button>
            <Button to="/assessment" variant="outline" size="lg">
              Take Wellbeing Check-in
            </Button>
          </div>
        </section>

        {/* Foundation Handoff Card for Developer 1 */}
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <Card variant="default" padding="lg">
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span className="vz-chip lavender">
                  <Sparkles size={14} /> Developer 1 Assignment
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)' }}>
                  Source: <code>index.html</code> (preserved as <code>index.original.html</code>)
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', marginTop: '12px' }}>Home Page Migration Foundation</h2>
            </Card.Header>
            <Card.Body>
              <p style={{ marginBottom: '16px' }}>
                This is the React entry point for the marketing & trust-building home page. The shared layout, design tokens, header, navbar, button, and card components are already loaded.
              </p>
              <ul style={{ paddingLeft: '20px', color: 'var(--vz-text-secondary)', lineHeight: '1.8' }}>
                <li><strong>Next step:</strong> Migrate the hero section, 4 feature cards ("Understand Yourself", "Get Support", "Connect with Real People", "Professional Help"), snack banner, and life pressure cards.</li>
                <li><strong>Shared components to use:</strong> <code>&lt;Card&gt;</code>, <code>&lt;Button&gt;</code>, <code>&lt;AppLayout&gt;</code>.</li>
              </ul>
            </Card.Body>
            <Card.Footer>
              <Button to="/assessment" variant="soft" size="sm" icon={<ArrowRight size={14} />}>
                Go to Assessment Page
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
