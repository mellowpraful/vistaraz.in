import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Calendar,
  MessageSquare,
  Video,
  LogOut,
  ArrowRight,
  Smile,
  Activity,
  Heart,
  ClipboardList,
  BarChart2,
  Loader2,
} from 'lucide-react';
import './DashboardPage.css';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/clientService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.name || 'Friend';

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const json = await getDashboardStats();
        if (!cancelled) setStats(json.data);
      } catch (err) {
        if (!cancelled) setStatsError('Could not load your dashboard data.');
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppLayout hasSidebar={true}>
      <div className="vz-dashboard-page">

        {/* Welcome Header */}
        <div className="vz-dashboard-header">
          <div className="vz-dashboard-header__user">
            <div className="vz-dashboard-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="vz-dashboard-title">
                Welcome back, <em className="vz-text-violet">{userName}</em>
              </h1>
              <p className="vz-dashboard-subtitle">
                Here is a live summary of your wellbeing and care activity.
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

        {/* Stats Error */}
        {statsError && (
          <div className="cp-alert cp-alert--warning" style={{ marginBottom: '24px' }}>
            ⚠️ {statsError}
          </div>
        )}

        {/* Live Stats Cards */}
        <div className="vz-dashboard-grid-3">

          {/* Card 1: Sessions */}
          <Card variant="default" padding="lg" className="vz-dash-card">
            <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>SESSIONS</span>
            {statsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <Loader2 size={18} className="spin" color="var(--vz-primary)" />
                <span style={{ color: 'var(--vz-text-muted)', fontSize: '0.9rem' }}>Loading…</span>
              </div>
            ) : (
              <>
                <h2 className="vz-dash-card__title" style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0 4px' }}>
                  {stats?.totalCompletedSessions ?? 0}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)', marginBottom: '20px' }}>
                  Total completed sessions
                </p>
                {(stats?.upcomingSessionsCount ?? 0) > 0 && (
                  <span className="vz-chip mint" style={{ fontSize: '0.78rem' }}>
                    {stats.upcomingSessionsCount} upcoming
                  </span>
                )}
              </>
            )}
            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <Button to="/client-panel" variant="outline" size="sm" fullWidth icon={<ArrowRight size={14} />}>
                View All Sessions
              </Button>
            </div>
          </Card>

          {/* Card 2: Mood Check-ins */}
          <Card variant="default" padding="lg" className="vz-dash-card">
            <span className="vz-eyebrow" style={{ color: '#059669' }}>MOOD CHECK-INS</span>
            {statsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <Loader2 size={18} className="spin" color="#059669" />
                <span style={{ color: 'var(--vz-text-muted)', fontSize: '0.9rem' }}>Loading…</span>
              </div>
            ) : (
              <>
                <h2 className="vz-dash-card__title" style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0 4px' }}>
                  {stats?.totalMoodCheckins ?? 0}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)', marginBottom: '12px' }}>
                  Total mood logs recorded
                </p>
                {stats?.latestMood ? (
                  <span className="vz-chip mint" style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}>
                    Latest: {stats.latestMood}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>No check-ins yet</span>
                )}
              </>
            )}
            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <Button to="/client-panel" variant="outline" size="sm" fullWidth icon={<Smile size={14} />}>
                Log Today's Mood
              </Button>
            </div>
          </Card>

          {/* Card 3: Wellbeing Assessments */}
          <Card variant="default" padding="lg" className="vz-dash-card">
            <span className="vz-eyebrow" style={{ color: '#7c3aed' }}>WELLBEING</span>
            {statsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <Loader2 size={18} className="spin" color="#7c3aed" />
                <span style={{ color: 'var(--vz-text-muted)', fontSize: '0.9rem' }}>Loading…</span>
              </div>
            ) : (
              <>
                <h2 className="vz-dash-card__title" style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0 4px' }}>
                  {stats?.assessmentCount ?? 0}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)', marginBottom: '12px' }}>
                  Wellbeing reflections completed
                </p>
                {stats?.latestAssessment ? (
                  <span className="vz-chip" style={{ fontSize: '0.78rem', backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                    Latest: {stats.latestAssessment.resultTitle || 'Completed'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>No assessment yet</span>
                )}
              </>
            )}
            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <Button to="/assessment" variant="outline" size="sm" fullWidth icon={<ClipboardList size={14} />}>
                Start Reflection
              </Button>
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

        {/* Client Panel CTA */}
        <Card variant="default" padding="lg" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 600 }}>View Your Full Care Panel</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--vz-text-secondary)' }}>
              See your complete session history, mood timeline, and support requests.
            </p>
          </div>
          <Button to="/client-panel" variant="primary" size="md" icon={<ArrowRight size={16} />}>
            Open Client Panel
          </Button>
        </Card>

      </div>
    </AppLayout>
  );
}
