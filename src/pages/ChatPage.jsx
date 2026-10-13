import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Send,
  Video,
  Wind,
  Shield,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  User,
  Heart
} from 'lucide-react';
import './ChatPage.css';

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'listener',
    text: "Hi! 👋 It's good to have you here. This is a safe, judgment-free space. What's on your mind today?",
    time: '10:32 AM',
  },
  {
    id: 2,
    sender: 'user',
    text: "I've been feeling really stressed about exams. And I just needed to talk to someone...",
    time: '10:33 AM',
  },
  {
    id: 3,
    sender: 'listener',
    text: "That sounds really tough. You're not alone in feeling this. Want to tell me more about what's been the most stressful part?",
    time: '10:34 AM',
  },
];

const LISTENER_REPLIES = [
  "I hear you. Take a deep breath. We can take this one step at a time. What is the very first thing worrying you the most right now?",
  "It is completely valid to feel exhausted when you've been carrying this alone. How has your sleep and rest been over the past few days?",
  "Thank you for sharing that with me. Remember you don't have to prove anything to anyone here. What would feel like a small relief right now?",
  "That makes so much sense. Often our minds tell us we have to figure everything out at once. What if we focus just on today?",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBreathAlert, setShowBreathAlert] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate listener response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const randomReply = LISTENER_REPLIES[Math.floor(Math.random() * LISTENER_REPLIES.length)];
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'listener',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickChips = [
    'Academic Burnout',
    'Exams & Placement Fear',
    'Feeling Lonely',
    'Sleep & Racing Thoughts',
  ];

  return (
    <AppLayout hasSidebar={true}>
      <div className="vz-chat-page-container">
        {/* Main Chat Interface */}
        <div className="vz-chat-main">
          {/* Header */}
          <div className="vz-chat-header">
            <div className="vz-chat-header__profile">
              <div className="vz-chat-header__avatar">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Aanya"
                  className="vz-avatar"
                />
                <span className="vz-status-dot online vz-chat-header__dot" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Aanya</h2>
                  <CheckCircle2 size={16} color="var(--vz-primary)" />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                  Trained Listener · Online
                </span>
              </div>
            </div>

            <div className="vz-chat-header__actions">
              <button
                type="button"
                className="vz-chat-action-btn"
                onClick={() => setShowBreathAlert(!showBreathAlert)}
                title="Breathe together"
              >
                <Wind size={18} />
                <span className="vz-hide-mobile">Take a Breath</span>
              </button>
              <Link to="/video-call" className="vz-chat-action-btn" title="Switch to video call">
                <Video size={18} />
                <span className="vz-hide-mobile">Video Call</span>
              </Link>
              <Link to="/safety" className="vz-chat-action-btn danger" title="Urgent Safety">
                <ShieldAlert size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Breath Notification */}
          {showBreathAlert && (
            <div className="vz-chat-breath-toast">
              <Wind size={18} color="var(--vz-primary)" />
              <span>Gently pause for a second. Drop your shoulders away from your ears.</span>
              <button type="button" onClick={() => setShowBreathAlert(false)}>✕</button>
            </div>
          )}

          {/* Chat Feed */}
          <div className="vz-chat-stream">
            <div className="vz-chat-notice">
              <span>🔒 100% Private & Anonymous Session · First 15 minutes are on us</span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`vz-chat-bubble-row ${m.sender === 'user' ? 'user' : 'listener'}`}
              >
                {m.sender === 'listener' && (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="Aanya"
                    className="vz-chat-msg-avatar"
                  />
                )}
                <div className="vz-chat-bubble-container">
                  <div className={`vz-chat-bubble ${m.sender}`}>
                    <p>{m.text}</p>
                  </div>
                  <span className="vz-chat-bubble-time">{m.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="vz-chat-bubble-row listener">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                  alt="Aanya"
                  className="vz-chat-msg-avatar"
                />
                <div className="vz-chat-typing-card">
                  <span>Aanya is typing...</span>
                  <div className="vz-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="vz-chat-chips">
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="vz-chat-chip-btn"
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Composer Input */}
          <div className="vz-chat-composer">
            <textarea
              className="vz-chat-composer__input"
              rows={1}
              placeholder="Type your message... you are completely safe."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="accent"
              size="md"
              icon={<Send size={16} />}
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
            >
              Send
            </Button>
          </div>
        </div>

        {/* Right Listener Profile Card matching reference image */}
        <aside className="vz-chat-listener-sidebar">
          <Card variant="default" padding="lg" className="vz-chat-profile-card">
            <div className="vz-chat-profile-card__avatar-wrap">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80"
                alt="Aanya"
                className="vz-chat-profile-card__img"
              />
              <span className="vz-status-dot online vz-chat-profile-card__dot" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Aanya</h3>
              <CheckCircle2 size={18} color="var(--vz-primary)" />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--vz-text-muted)' }}>Trained Listener</span>
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>● Online</span>

            <div className="vz-chat-profile-card__tags">
              <span className="vz-chip mint">Anxiety</span>
              <span className="vz-chip peach">Stress</span>
              <span className="vz-chip lavender">Academic Support</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--vz-text-secondary)', textAlign: 'center', margin: '14px 0' }}>
              "Here to offer a patient ear without unsolicited advice. Let's untangle whatever feels noisy right now."
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button to="/support" variant="outline" size="sm" fullWidth>
                View Listener Profile
              </Button>
              <Button to="/safety" variant="ghost" size="sm" icon={<ShieldAlert size={14} />} fullWidth>
                Crisis Resources
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}
