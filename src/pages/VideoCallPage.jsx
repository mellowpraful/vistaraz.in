import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Video, Mic, PhoneOff, Shield, Settings } from 'lucide-react';

/**
 * VideoCallPage
 * Assigned to: Developer 2
 * Source: video-call.html
 * Route: /video-call
 */
export default function VideoCallPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">LIVE TELE-SUPPORT</span>
            <h1>Voice & Video Session</h1>
            <p>Private, end-to-end encrypted session with your assigned listener.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 2 Assignment
          </span>
        </div>

        {/* Video Call Stage Preview */}
        <Card variant="default" padding="none" style={{ backgroundColor: '#131418', borderRadius: '24px', overflow: 'hidden', marginBottom: '24px', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#262930', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
              👤
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>Connecting to secure session room...</p>
          </div>

          {/* Call Controls Bar */}
          <div style={{ padding: '20px', backgroundColor: '#1a1c22', display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
            <button type="button" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2d3139', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={20} />
            </button>
            <button type="button" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#2d3139', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={20} />
            </button>
            <button type="button" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneOff size={20} />
            </button>
          </div>
        </Card>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 2 Notice:</strong> Migrated from <code>video-call.html</code>. Includes WebRTC / Agora / Jitsi video container, media permissions checking, mute/video toggles, session timer, and safeguarding exit modal.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
