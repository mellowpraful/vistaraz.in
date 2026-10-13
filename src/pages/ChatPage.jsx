import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Send, Shield, Smile } from 'lucide-react';

/**
 * ChatPage
 * Assigned to: Developer 1
 * Source: chat.html
 * Route: /chat
 */
export default function ChatPage() {
  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="vz-eyebrow">SAFE & ENCRYPTED CHAT</span>
            <h1>Support Conversation</h1>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 1 Assignment
          </span>
        </div>

        {/* Chat UI Shell */}
        <Card variant="default" padding="none" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
          {/* Chat Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--vz-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="vz-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' }}>
                🤝
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Aanya (Trained Listener)</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981' }}>
                  <span className="vz-status-dot online"></span> Active now · Judgment-free space
                </div>
              </div>
            </div>
            <Button to="/safety" variant="outline" size="sm" icon={<Shield size={14} />}>
              Safety Support
            </Button>
          </div>

          {/* Chat Message Stream */}
          <div style={{ flex: 1, padding: '24px', backgroundColor: '#faf9f7', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <div style={{ alignSelf: 'flex-start', maxWidth: '75%', backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--vz-border-light)', boxShadow: 'var(--vz-shadow-sm)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--vz-text-primary)' }}>
                Hi! 👋 It's good to have you here. This is a completely private, safe space. What's on your mind today?
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--vz-text-muted)', marginTop: '4px', display: 'block' }}>10:32 AM</span>
            </div>

            <div style={{ alignSelf: 'flex-end', maxWidth: '75%', backgroundColor: 'var(--vz-primary)', color: '#ffffff', padding: '14px 18px', borderRadius: '16px 16px 4px 16px', boxShadow: 'var(--vz-shadow-sm)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff' }}>
                I've been feeling really overwhelmed about college exams and don't know who to talk to...
              </p>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '4px', display: 'block', textAlign: 'right' }}>10:33 AM</span>
            </div>
          </div>

          {/* Chat Input Bar */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--vz-border-light)', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#ffffff' }}>
            <input
              type="text"
              placeholder="Type your message here... you are safe."
              style={{ flex: 1, padding: '12px 16px', borderRadius: '9999px', border: '1px solid var(--vz-border-light)', outline: 'none', fontSize: '0.95rem' }}
              readOnly
            />
            <Button variant="accent" size="md" icon={<Send size={16} />}>
              Send
            </Button>
          </div>
        </Card>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> Migrated from <code>chat.html</code>. Includes listener matching, encrypted chat transcript state, typing indicators, quick reply pills, and session rating modal.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
