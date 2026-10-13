import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Watch,
  Calendar,
  MessageSquare,
  Video,
  LogOut,
  ArrowRight,
  Sparkles,
  Settings,
  Smile,
  Activity,
  Heart,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showWearableBanner, setShowWearableBanner] = useState(true);
  const [userName, setUserName] = useState('Friend');
  const [userPlan, setUserPlan] = useState('Silver');

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <AppLayout hasSidebar={true}>
      <div className="vz-dashboard-page">
        {/* Welcome Header */}
        <div className="vz-dashboard-header">
          <div className="vz-dashboard-header__user">
            <div className="vz-dashboard-avatar">🦊</div>
            <div>
              <h1 className="vz-dashboard-title">
                Welcome back, <em className="vz-text-violet">{userName}</em>
              </h1>
              <p className="vz-dashboard-subtitle">
                Here is a summary of your wellbeing, upcoming support, and active care plan.
              </p>
            </div>
          </div>

          <div className="vz-dashboard-actions">
            <Button to="/assessment" variant="outline" size="sm" icon={<Smile size={15} />}>
              Quick Check-in
            </Button>
            <button
              type="button"
              className="vz-btn vz-btn--ghost vz-btn--sm"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut size={16} style={{ marginRight: '6px' }} /> Sign Out
            </button>
          </div>
        </div>

        {/* Wearable Insight Banner */}
        {showWearableBanner && (
          <div className="vz-wearable-card">
            <div className="vz-wearable-card__left">
              <div className="vz-wearable-icon-wrap">
                <Watch size={24} color="var(--vz-primary)" />
              </div>
              <div>
                <h3 className="vz-wearable-card__title">Wearable Insight</h3>
                <p className="vz-wearable-card__desc">
                  Your average sleep duration dropped by 1.5 hours over the last 3 days. Would you like to do a quick 2-minute check-in?
                </p>
              </div>
            </div>
            <div className="vz-wearable-card__actions">
              <button
                type="button"
                className="vz-btn vz-btn--ghost vz-btn--sm"
                onClick={() => setShowWearableBanner(false)}
              >
                Dismiss
              </button>
              <Button to="/assessment" variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                Check-in
              </Button>
            </div>
          </div>
        )}

        {/* 3 Core Overview Cards */}
        <div className="vz-dashboard-grid-3">
          {/* Card 1: Active Membership */}
          <Card variant="default" padding="lg" className="vz-dash-card">
            <span className="vz-eyebrow">YOUR PLAN</span>
            <h2 className="vz-dash-card__title">{userPlan} Membership</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)', marginBottom: '20px' }}>
              Renewal Date: 28th of this month
            </p>

            <div className="vz-dash-meter-group">
              <div className="vz-dash-meter-header">
                <span>Chat Allowance</span>
                <strong>3.5 / 4.0 hrs used</strong>
              </div>
              <div className="vz-dash-meter-track">
                <div className="vz-dash-meter-fill" style={{ width: '85%', backgroundColor: '#f59e0b' }} />
              </div>
            </div>

            <div className="vz-dash-meter-group" style={{ marginTop: '16px' }}>
              <div className="vz-dash-meter-header">
                <span>Voice / Video</span>
                <strong>0 / 30 mins used</strong>
              </div>
              <div className="vz-dash-meter-track">
                <div className="vz-dash-meter-fill" style={{ width: '15%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <Button to="/plans" variant="outline" size="sm" fullWidth>
                Upgrade to Gold Plan
              </Button>
            </div>
          </Card>

          {/* Card 2: Upcoming Support */}
          <Card variant="default" padding="lg" className="vz-dash-card">
            <span className="vz-eyebrow" style={{ color: '#059669' }}>
              UPCOMING SUPPORT
            </span>
            <h2 className="vz-dash-card__title">Live Video Session</h2>

            <div className="vz-dash-session-preview">
              <div className="vz-dash-session-avatar">S</div>
              <div>
                <strong>Dr. Nidhi M.</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-secondary)', margin: '2px 0 0' }}>
                  Tomorrow at 4:00 PM (45 mins)
                </p>
                <span className="vz-chip mint" style={{ marginTop: '6px', fontSize: '0.74rem' }}>
                  Confirmed Booking
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button to="/video-call" variant="primary" size="sm" fullWidth icon={<Video size={14} />}>
                Join Waiting Room
              </Button>
              <Button to="/chat" variant="ghost" size="sm" fullWidth>
                Message Listener First
              </Button>
            </div>
          </Card>

          {/* Card 3: Connected Devices */}
          <Card variant="default" padding="lg" className="vz-dash-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
                CONNECTED DEVICES
              </span>
              <span className="vz-chip mint" style={{ fontSize: '0.72rem' }}>
                Active Sync
              </span>
            </div>
            <h2 className="vz-dash-card__title">Apple Watch Series 8</h2>

            <div className="vz-dash-device-box">
              <Watch size={32} color="var(--vz-primary)" />
              <div>
                <strong>Syncing Health Signals</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--vz-text-secondary)', margin: 0 }}>
                  Sleep stages & resting heart rate
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--vz-text-muted)', lineHeight: '1.4', marginTop: '14px' }}>
              Your biometric signals are never diagnosed. They only provide gentle cues to pause when strain is detected.
            </p>

            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button type="button" className="vz-btn vz-btn--outline vz-btn--sm vz-btn--full">
                <Settings size={14} style={{ marginRight: '6px' }} /> Manage Permissions
              </button>
            </div>
          </Card>
        </div>

        {/* Quick Access Bar */}
        <div className="vz-dashboard-quick-row">
          <Card variant="default" padding="md" hoverable={true} className="vz-dash-quick-item">
            <MessageSquare size={22} color="var(--vz-primary)" />
            <div>
              <strong>Start Free Chat</strong>
              <p>Connect with a trained listener</p>
            </div>
            <Link to="/chat" className="vz-dash-quick-arrow">→</Link>
          </Card>

          <Card variant="default" padding="md" hoverable={true} className="vz-dash-quick-item">
            <Activity size={22} color="#059669" />
            <div>
              <strong>Breathing Sanctuary</strong>
              <p>4-4-4-4 nervous system reset</p>
            </div>
            <Link to="/tools" className="vz-dash-quick-arrow">→</Link>
          </Card>

          <Card variant="default" padding="md" hoverable={true} className="vz-dash-quick-item">
            <Heart size={22} color="#d97706" />
            <div>
              <strong>Community Circles</strong>
              <p>Share reflections with peers</p>
            </div>
            <Link to="/community" className="vz-dash-quick-arrow">→</Link>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
