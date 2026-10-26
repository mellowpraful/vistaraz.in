import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Send, Lock, Clock
} from 'lucide-react';
import logoImg from '../assets/images/logo.png';
import './VideoCallPage.css';

/**
 * VideoCallPage
 * Assigned to: Developer 2
 * Source: video-call.html
 * Route: /video-call
 *
 * Live tele-support voice & video session room.
 * Includes: WebRTC camera/microphone access, media stream viewport,
 * audio mute / video pause buttons, live session timer,
 * in-call chat panel, private notes, and emergency exit.
 */

const INITIAL_CHAT = [
  { id: 1, type: 'system', text: '🔒 Session started. Your chat is encrypted and private.' },
  { id: 2, type: 'listener', sender: 'Dr. Nidhi Sharma', text: 'Hello! I am right here with you. Take your time.' },
];

export default function VideoCallPage() {
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [connecting, setConnecting] = useState(true);
  const [connectProgress, setConnectProgress] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [notes, setNotes] = useState('');
  const [camFallback, setCamFallback] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const chatContainerRef = useRef(null);

  // ── Connection sequence ──
  useEffect(() => {
    const t1 = setTimeout(() => setConnectProgress(60), 500);
    const t2 = setTimeout(() => setConnectProgress(100), 1600);
    const t3 = setTimeout(() => {
      setConnecting(false);
      setTimerRunning(true);
    }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ── WebCam access ──
  useEffect(() => {
    async function initWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch {
        setCamFallback(true);
      }
    }
    initWebcam();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ── Session timer ──
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formattedTimer = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;

  // ── Auto-scroll chat ──
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ── Mute toggle ──
  function toggleMute() {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
        return;
      }
    }
    setIsMuted((v) => !v);
  }

  // ── Camera toggle ──
  function toggleCamera() {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsCamOff(!track.enabled);
        setCamFallback(!track.enabled);
        return;
      }
    }
    setIsCamOff((v) => !v);
    setCamFallback((v) => !v);
  }

  // ── Screen share ──
  async function toggleScreenShare() {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = displayStream;
      }
    } catch {
      // User cancelled — no action needed
    }
  }

  // ── Send chat ──
  function handleSendChat(e) {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'self', text: msg },
    ]);
    setChatInput('');
  }

  // ── End call ──
  function endCall() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setTimerRunning(false);
    navigate('/listener-portal');
  }

  return (
    <div className="vc-shell">
      {/* Connecting Overlay */}
      {connecting && (
        <div className="vc-connecting-overlay" role="status" aria-label="Connecting to session">
          <div className="vc-connecting-rings" aria-hidden="true">
            <div className="vc-ring vc-ring--ping" />
            <div className="vc-ring vc-ring--spin" />
            <div className="vc-connecting-icon">📹</div>
          </div>
          <h2 className="vc-connecting-title">Connecting with your listener...</h2>
          <p className="vc-connecting-sub">Establishing peer-to-peer HD video session and verifying microphone feed.</p>
          <div className="vc-progress-track" aria-hidden="true">
            <div className="vc-progress-fill" style={{ width: `${connectProgress}%` }} />
          </div>
          <p className="vc-connecting-enc">
            <Lock size={12} /> 256-Bit End-to-End Encrypted Session
          </p>
        </div>
      )}

      {/* Header */}
      <header className="vc-header">
        <div className="vc-header-left">
          <a href="/" className="vc-brand" aria-label="Vistaraz home">
            <img src={logoImg} alt="Vistaraz" height={36} />
          </a>
          <div className="vc-session-info">
            <span className="vc-session-dot" aria-hidden="true" />
            <span className="vc-session-status" id="callStatusText">Session Live</span>
            <span className="vc-separator" aria-hidden="true">·</span>
            <span className="vc-timer" id="callTimer" aria-label={`Session duration: ${formattedTimer}`}>
              <Clock size={12} /> {formattedTimer}
            </span>
          </div>
        </div>
        <div className="vc-header-right">
          <span className="vc-enc-badge" aria-label="End-to-end encrypted">
            <Lock size={12} /> E2E Encrypted
          </span>
          <button
            type="button"
            className="vc-exit-link"
            onClick={() => setEndModalOpen(true)}
            aria-label="Exit session room"
          >
            Exit Room
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main className="vc-workspace">
        {/* Primary video area */}
        <div className="vc-primary-area">
          <div className="vc-remote-viewport">
            {/* Remote listener view (no photo — abstract presence) */}
            <div className="vc-remote-content" aria-label="Listener video feed">
              <div className="vc-glow-ring vc-glow-ring--1" aria-hidden="true" />
              <div className="vc-glow-ring vc-glow-ring--2" aria-hidden="true" />

              {/* Animated listener avatar */}
              <div className="vc-listener-avatar-wrap" aria-hidden="true">
                <div className="vc-listener-pulse vc-listener-pulse--outer" />
                <div className="vc-listener-pulse vc-listener-pulse--spin" />
                <div className="vc-listener-avatar">🩺</div>
              </div>

              <h3 className="vc-listener-name">Dr. Nidhi Sharma</h3>
              <p className="vc-listener-role">Verified Support Listener · Live Stream</p>
              <div className="vc-enc-pill" aria-label="HD Audio and data encrypted">
                <span className="vc-enc-dot" aria-hidden="true" />
                HD Audio &amp; Data Encrypted
              </div>
            </div>

            {/* Top info badge */}
            <div className="vc-info-badge" aria-live="polite">
              <span className="vc-badge-dot" aria-hidden="true" />
              <span className="vc-badge-name">Dr. Nidhi Sharma</span>
              <span className="vc-badge-role">· Peer Support Listener</span>
            </div>

            {/* Audio waveform indicator */}
            <div className="vc-waveform" aria-hidden="true">
              <Mic size={12} />
              <span className="vc-bar vc-bar--1" />
              <span className="vc-bar vc-bar--2" />
              <span className="vc-bar vc-bar--3" />
              <span className="vc-bar vc-bar--4" />
              <span className="vc-waveform-label">Audio Active</span>
            </div>

            {/* PIP self-cam */}
            <div className="vc-pip" aria-label="Your camera feed">
              <video
                ref={localVideoRef}
                id="localVideo"
                className="vc-pip-video"
                autoPlay
                playsInline
                muted
              />
              {camFallback && (
                <div id="camFallback" className="vc-pip-fallback">
                  <div className="vc-pip-fallback-avatar">YOU</div>
                  <span className="vc-pip-fallback-label">Camera Off</span>
                </div>
              )}
              <div className="vc-pip-badge" aria-hidden="true">
                <span className="vc-pip-dot" />
                You
              </div>
            </div>

            {/* Controls toolbar */}
            <div className="vc-controls" role="toolbar" aria-label="Call controls">
              <button
                id="btnMute"
                type="button"
                className={`vc-ctrl-btn ${isMuted ? 'vc-ctrl-btn--off' : ''}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                aria-pressed={isMuted}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                id="btnCam"
                type="button"
                className={`vc-ctrl-btn ${isCamOff ? 'vc-ctrl-btn--off' : ''}`}
                onClick={toggleCamera}
                title={isCamOff ? 'Start Camera' : 'Stop Camera'}
                aria-pressed={isCamOff}
                aria-label={isCamOff ? 'Turn camera on' : 'Turn camera off'}
              >
                {isCamOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>

              <button
                id="btnShare"
                type="button"
                className="vc-ctrl-btn"
                onClick={toggleScreenShare}
                title="Share Screen"
                aria-label="Share your screen"
              >
                <MonitorUp size={18} />
              </button>

              <button
                type="button"
                className="vc-ctrl-btn vc-ctrl-btn--end"
                onClick={() => setEndModalOpen(true)}
                title="End Session"
                aria-label="End call"
              >
                <PhoneOff size={18} /> <span>End</span>
              </button>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="vc-side-panel">
          {/* In-call chat */}
          <div className="vc-chat-panel">
            <div className="vc-chat-header">
              <div className="vc-chat-title-row">
                <span className="vc-chat-title">In-Session Chat</span>
                <span className="vc-chat-live">● Active</span>
              </div>
            </div>

            <div className="vc-chat-messages" ref={chatContainerRef} aria-live="polite" aria-label="Chat messages">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`vc-chat-msg vc-chat-msg--${msg.type}`}
                >
                  {msg.type === 'listener' && (
                    <span className="vc-chat-sender">{msg.sender}</span>
                  )}
                  {msg.type === 'self' && (
                    <span className="vc-chat-sender vc-chat-sender--you">You</span>
                  )}
                  <span className="vc-chat-text">{msg.text}</span>
                </div>
              ))}
            </div>

            <form className="vc-chat-form" onSubmit={handleSendChat}>
              <input
                id="chatInput"
                type="text"
                className="vc-chat-input"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                aria-label="Chat message input"
                autoComplete="off"
              />
              <button type="submit" className="vc-chat-send" aria-label="Send message">
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Private Notes */}
          <div className="vc-notes-panel">
            <h3 className="vc-notes-title">📋 Private Notes</h3>
            <textarea
              id="privateNotes"
              className="vc-notes-input"
              placeholder="Write any notes or reminders for yourself during the session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="Private session notes"
            />
          </div>
        </aside>
      </main>

      {/* End Call Confirmation Modal */}
      {endModalOpen && (
        <div
          className="vc-end-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="End session confirmation"
          onClick={(e) => { if (e.target === e.currentTarget) setEndModalOpen(false); }}
        >
          <div className="vc-end-modal">
            <div className="vc-end-modal-icon" aria-hidden="true">📞</div>
            <h2 className="vc-end-modal-title">End Session?</h2>
            <p className="vc-end-modal-desc">
              Are you sure you want to end this session? Your notes will be saved. If you're in
              crisis, please contact a helpline before leaving.
            </p>
            <div className="vc-end-modal-actions">
              <button type="button" className="vc-end-confirm-btn" onClick={endCall}>
                End Session
              </button>
              <button type="button" className="vc-end-cancel-btn" onClick={() => setEndModalOpen(false)}>
                Continue Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
