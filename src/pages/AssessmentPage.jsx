import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ArrowRight, Sparkles, Smile, Heart, CheckCircle2 } from 'lucide-react';

/**
 * AssessmentPage
 * Assigned to: Developer 1
 * Source: assessment.html
 * Route: /assessment
 */
export default function AssessmentPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">STEP 2 OF 8</span>
            <h1>Wellbeing Assessment</h1>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 1 Assignment
          </span>
        </div>

        {/* Reference Mood Selector Component Preview */}
        <Card variant="default" padding="lg" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>How have you been feeling lately?</h2>
          <p style={{ marginBottom: '24px' }}>Choose the option that feels closest to you right now.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <Card variant="pink" padding="md" hoverable={true} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>😔</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--vz-pastel-pink-text)' }}>Very Low</strong>
            </Card>
            <Card variant="peach" padding="md" hoverable={true} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🙁</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--vz-pastel-peach-text)' }}>Low</strong>
            </Card>
            <Card variant="yellow" padding="md" selected={true} hoverable={true} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>😐</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--vz-pastel-yellow-text)' }}>Okay</strong>
            </Card>
            <Card variant="mint" padding="md" hoverable={true} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🙂</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--vz-pastel-mint-text)' }}>Good</strong>
            </Card>
            <Card variant="sky" padding="md" hoverable={true} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>😊</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--vz-pastel-sky-text)' }}>Really Good</strong>
            </Card>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button to="/" variant="ghost" size="md">
              Save & Exit
            </Button>
            <Button variant="primary" size="md" icon={<ArrowRight size={16} />}>
              Next Step
            </Button>
          </div>
        </Card>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> This page migrates the 10-Area non-diagnostic interactive mental health check-in from <code>assessment.html</code>. Includes questions, progress indicators, scoring calculations, and tailored recommendations.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
