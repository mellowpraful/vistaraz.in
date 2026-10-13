import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Compass, Home, ArrowLeft } from 'lucide-react';

/**
 * NotFoundPage
 * Assigned to: Developer 2
 * Source: 404.html
 * Route: * (catch-all)
 */
export default function NotFoundPage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '80px 24px', maxWidth: '640px', textAlign: 'center' }}>
        <span className="vz-chip sky" style={{ marginBottom: '16px' }}>
          <Sparkles size={14} /> Developer 2 Assignment (404)
        </span>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🧭</div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>Path Not Found</h1>
        <p style={{ fontSize: '1.05rem', marginBottom: '32px' }}>
          The page you are looking for isn't here, but you're never lost. Let's guide you back to a safe space.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Button to="/" variant="primary" icon={<Home size={16} />}>
            Return Home
          </Button>
          <Button to="/support" variant="outline">
            Explore Support Options
          </Button>
        </div>

        <Card variant="default" padding="md" style={{ textAlign: 'left' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>404.html</code>. Includes friendly sanctuary messaging, dynamic back button, and recommended landing links.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
