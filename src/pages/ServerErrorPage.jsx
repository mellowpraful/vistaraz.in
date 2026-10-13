import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, RefreshCw, Home, Shield } from 'lucide-react';

/**
 * ServerErrorPage
 * Assigned to: Developer 2
 * Source: 500.html
 * Route: /error-500
 */
export default function ServerErrorPage() {
  return (
    <AppLayout>
      <div className="vz-container" style={{ padding: '80px 24px', maxWidth: '640px', textAlign: 'center' }}>
        <span className="vz-chip peach" style={{ marginBottom: '16px' }}>
          <Sparkles size={14} /> Developer 2 Assignment (500)
        </span>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>☕</div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>A Gentle Pause</h1>
        <p style={{ fontSize: '1.05rem', marginBottom: '32px' }}>
          Our server encountered a momentary hiccup. Take a deep breath — your data is safe and our systems are gently resetting.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            icon={<RefreshCw size={16} />}
          >
            Try Refreshing
          </Button>
          <Button to="/" variant="outline" icon={<Home size={16} />}>
            Back to Home
          </Button>
        </div>

        <Card variant="default" padding="md" style={{ textAlign: 'left' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>500.html</code>. Includes server resilience diagnostics, retry mechanism, connectivity status monitoring, and error reporting.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
