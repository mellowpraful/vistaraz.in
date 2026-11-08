import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Lock,
  Clock,
  Shield,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import logoImg from '../assets/images/logo.png';
import SupportDisclaimerModal from '../components/common/SupportDisclaimerModal';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import './VideoCallPage.css';

/**
 * VideoCallPage
 * Full-page Video Support Waiting Room.
 *
 * Professional UI refinement inspired by Google Meet & Microsoft Teams.
 * In accordance with launch requirements:
 * - Fictional doctor/listener "Dr. Nidhi Sharma", simulated participant streams, and fake chat removed.
 * - Does not pretend WebRTC is functional; does not activate user camera/mic unprompted.
 * - Displays a polished "Video Support Coming Soon" state.
 * - Enforces mandatory clinical/emergency disclaimer before entering the room.
 */
export default function VideoCallPage() {
  const navigate = useNavigate();
  const { user, seekerProfile } = useAuth();

  // Disclaimer modal
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Staging control states (visual only, hardware safely unprompted)
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCamOff, setIsCamOff] = useState(true);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const seekerName = seekerProfile?.realName || user?.seekerProfile?.realName || user?.name || 'Support Seeker';

  return (
    <div className="vz-video-shell">
      {/* ── Mandatory Disclaimer Modal ── */}
      <SupportDisclaimerModal
        isOpen={!disclaimerAccepted}
        mode="video"
        hasAcknowledged={hasAcknowledged}
        setHasAcknowledged={setHasAcknowledged}
        onAcknowledge={() => setDisclaimerAccepted(true)}
        onCancel={() => navigate('/client-panel')}
      />

      {/* Header bar matching Google Meet / Teams style */}
      <header className="vz-video-header">
        <div className="vz-video-header__left">
          <Link to="/client-panel" className="vz-video-brand" aria-label="Return to Client Panel">
            <img src={logoImg} alt="Vistaraz" height={32} />
          </Link>
          <div className="vz-video-room-meta">
            <span className="vz-video-room-tag">VIDEO SANCTUARY STAGING</span>
            <span className="vz-video-room-title">Peer Video Waiting Room</span>
          </div>
        </div>

        <div className="vz-video-header__right">
          <div className="vz-video-enc-pill" aria-label="Encryption status">
            <Lock size={12} />
            <span>E2E Encrypted Architecture</span>
          </div>

          <button
            type="button"
            className="vz-video-exit-btn"
            onClick={() => setExitModalOpen(true)}
          >
            Leave Waiting Room
          </button>
        </div>
      </header>

      {/* Main Video Stage */}
      <main className="vz-video-workspace">
        <div className="vz-video-stage-card">
          {/* Central Waiting Screen (Google Meet / Teams Staging View) */}
          <div className="vz-video-viewport">
            <div className="vz-video-staging-content">
              {/* Abstract Calm Animated Graphic */}
              <div className="vz-video-avatar-pulse-wrap" aria-hidden="true">
                <div className="vz-pulse-ring vz-pulse-ring--1" />
                <div className="vz-pulse-ring vz-pulse-ring--2" />
                <div className="vz-video-camera-icon">
                  <Video size={36} color="var(--vz-primary, #6366f1)" />
                </div>
              </div>

              <span className="vz-chip lavender" style={{ margin: '0 auto 10px' }}>
                SERVICE NOTICE
              </span>

              <h1 className="vz-video-staging-title">Video Support Coming Soon</h1>

              <p className="vz-video-staging-subtitle">
                High-definition, peer-to-peer encrypted video consultations are currently being prepared with strict clinical privacy safeguards. Live video sessions are not active yet.
              </p>

              <div className="vz-video-safety-box">
                <div className="vz-video-safety-item">
                  <CheckCircle2 size={16} className="vz-check-icon" />
                  <span>Hardware camera and microphone are safely inactive</span>
                </div>
                <div className="vz-video-safety-item">
                  <CheckCircle2 size={16} className="vz-check-icon" />
                  <span>No simulated recordings or fictional doctor personas</span>
                </div>
                <div className="vz-video-safety-item">
                  <CheckCircle2 size={16} className="vz-check-icon" />
                  <span>Emergency crisis support remains available 24/7 via helpline <strong>112</strong></span>
                </div>
              </div>

              <div className="vz-video-actions">
                <Button
                  to="/client-panel"
                  variant="primary"
                  size="md"
                  icon={<ArrowLeft size={16} />}
                  iconPosition="left"
                >
                  Return to Care Panel
                </Button>

                <Button
                  to="/assessment"
                  variant="outline"
                  size="md"
                  icon={<Sparkles size={16} />}
                >
                  Take Wellbeing Assessment Instead
                </Button>
              </div>
            </div>

            {/* Self-Preview Staging Window (Clean Placeholder, no invasive webcam auto-trigger) */}
            <div className="vz-video-self-pip">
              <div className="vz-pip-content">
                <span className="vz-pip-icon">🛡️</span>
                <span className="vz-pip-name">You (Camera Paused)</span>
                <span className="vz-pip-sub">Microphone Muted</span>
              </div>
            </div>
          </div>

          {/* Minimal Bottom Control Toolbar (Meet / Teams reference) */}
          <footer className="vz-video-toolbar" role="toolbar" aria-label="Meeting controls">
            <div className="vz-video-toolbar__left">
              <span className="vz-toolbar-room-id">
                <Shield size={14} color="#059669" />
                <span>Sanctuary Room: Ready for Onboarding</span>
              </span>
            </div>

            <div className="vz-video-toolbar__center">
              <button
                type="button"
                className={`vz-ctrl-pill ${isMicMuted ? 'muted' : ''}`}
                onClick={() => setIsMicMuted((v) => !v)}
                title={isMicMuted ? 'Microphone is off' : 'Microphone is on'}
                aria-label="Toggle microphone state"
              >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isMicMuted ? 'Mic Off' : 'Mic On'}</span>
              </button>

              <button
                type="button"
                className={`vz-ctrl-pill ${isCamOff ? 'muted' : ''}`}
                onClick={() => setIsCamOff((v) => !v)}
                title={isCamOff ? 'Camera is off' : 'Camera is on'}
                aria-label="Toggle camera state"
              >
                {isCamOff ? <VideoOff size={18} /> : <Video size={18} />}
                <span>{isCamOff ? 'Camera Off' : 'Camera On'}</span>
              </button>

              <button
                type="button"
                className="vz-ctrl-pill vz-ctrl-pill--end"
                onClick={() => setExitModalOpen(true)}
                title="Leave Video Waiting Room"
                aria-label="Leave video room"
              >
                <PhoneOff size={18} />
                <span>Leave</span>
              </button>
            </div>

            <div className="vz-video-toolbar__right">
              <Link to="/safety" className="vz-toolbar-safety-btn" title="Crisis Helplines">
                <ShieldAlert size={16} />
                <span className="vz-hide-mobile">Helplines (112)</span>
              </Link>
            </div>
          </footer>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {exitModalOpen && (
        <div
          className="vz-end-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Leave waiting room confirmation"
          onClick={(e) => { if (e.target === e.currentTarget) setExitModalOpen(false); }}
        >
          <div className="vz-end-modal">
            <div className="vz-end-modal-icon" aria-hidden="true">🚪</div>
            <h2 className="vz-end-modal-title">Leave Waiting Room?</h2>
            <p className="vz-end-modal-desc">
              You will be returned to your Client Care Panel. When live sessions open, you will be notified in your dashboard.
            </p>
            <div className="vz-end-modal-actions">
              <button
                type="button"
                className="vz-end-confirm-btn"
                onClick={() => navigate('/client-panel')}
              >
                Return to Panel
              </button>
              <button
                type="button"
                className="vz-end-cancel-btn"
                onClick={() => setExitModalOpen(false)}
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
