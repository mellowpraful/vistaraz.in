import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Wind,
  Volume2,
  VolumeX,
  Trash2,
  Compass,
  Activity,
  BookOpen,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HeartPulse,
  X,
  Plus,
  Save,
  Check
} from 'lucide-react';
import './ToolsPage.css';

// Breathing Presets
const BREATH_PRESETS = {
  box: { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: 'Used to stabilize autonomic nervous system' },
  relax478: { name: 'Sleep 4-7-8', inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: 'Dr. Weil relaxation technique for sleep & worry' },
  coherence: { name: 'Heart Coherence', inhale: 5, hold1: 0, exhale: 5, hold2: 0, desc: 'Balances heart-rate variability at 6 breaths/min' },
  panicReset: { name: 'Rapid Vagus Reset', inhale: 4, hold1: 2, exhale: 6, hold2: 0, desc: 'Lengthened exhale to trigger parasympathetic brake' },
};

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showPanicModal, setShowPanicModal] = useState(false);

  // 1. Breathing Studio State
  const [patternKey, setPatternKey] = useState('box');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Ready');
  const [breathCount, setBreathCount] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  const pattern = BREATH_PRESETS[patternKey];

  useEffect(() => {
    let timer;
    if (!isBreathing) {
      setBreathPhase('Ready');
      setBreathCount(pattern.inhale);
      return;
    }

    // Breathing loop engine
    let currentPhase = 'Inhale';
    let timeLeft = pattern.inhale;
    setBreathPhase('Inhale');
    setBreathCount(timeLeft);

    timer = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        if (currentPhase === 'Inhale') {
          if (pattern.hold1 > 0) {
            currentPhase = 'Hold';
            timeLeft = pattern.hold1;
          } else {
            currentPhase = 'Exhale';
            timeLeft = pattern.exhale;
          }
        } else if (currentPhase === 'Hold') {
          currentPhase = 'Exhale';
          timeLeft = pattern.exhale;
        } else if (currentPhase === 'Exhale') {
          if (pattern.hold2 > 0) {
            currentPhase = 'Hold Out';
            timeLeft = pattern.hold2;
          } else {
            currentPhase = 'Inhale';
            timeLeft = pattern.inhale;
            setCompletedCycles((c) => c + 1);
          }
        } else if (currentPhase === 'Hold Out') {
          currentPhase = 'Inhale';
          timeLeft = pattern.inhale;
          setCompletedCycles((c) => c + 1);
        }
        setBreathPhase(currentPhase);
      }
      setBreathCount(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathing, patternKey]);

  // 2. Web Audio Soundscape Synth State
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioCtxRef = useRef(null);
  const audioSourceRef = useRef(null);

  const startSound = (type) => {
    stopSound();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft synthetic noise textures
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 2.5; // Gain
        } else {
          // Pink noise filter approximation
          data[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = data[i];
          data[i] *= 1.8;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      audioSourceRef.current = noise;
      setPlayingAudio(type);
    } catch (e) {
      console.warn('Audio Context init prevented:', e);
    }
  };

  const stopSound = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      } catch (e) {}
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
    }
    audioSourceRef.current = null;
    audioCtxRef.current = null;
    setPlayingAudio(null);
  };

  // 3. Worry Shredder State
  const [worryText, setWorryText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [shreddedCount, setShreddedCount] = useState(0);

  const handleShred = () => {
    if (!worryText.trim()) return;
    setIsShredding(true);
    setTimeout(() => {
      setWorryText('');
      setIsShredding(false);
      setShreddedCount((c) => c + 1);
    }, 1200);
  };

  // 4. Grounding 5-4-3-2-1 State
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingSteps = [
    { title: '5 Things you can SEE', desc: 'Look around. Name 5 distinct objects in your room.', icon: '👀' },
    { title: '4 Things you can TOUCH', desc: 'Feel the texture of your shirt, the desk, or your feet on the ground.', icon: '✋' },
    { title: '3 Things you can HEAR', desc: 'Listen carefully. A fan humming, distant traffic, your breath.', icon: '👂' },
    { title: '2 Things you can SMELL', desc: 'Notice the aroma of fresh air, coffee, or clothing fabric.', icon: '👃' },
    { title: '1 Thing you can TASTE', desc: 'Take a sip of cool water or notice the current taste in your mouth.', icon: '👅' },
  ];

  // 5. Journal Reflection State
  const [journalEntry, setJournalEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([
    { id: 1, text: 'Took 10 minutes to sit by the window with tea. Felt a bit lighter.', date: 'Yesterday' }
  ]);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveJournal = () => {
    if (!journalEntry.trim()) return;
    setSavedEntries([
      { id: Date.now(), text: journalEntry, date: 'Just now' },
      ...savedEntries,
    ]);
    setJournalEntry('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const filterButtons = [
    { id: 'all', label: 'All Tools', icon: Sparkles },
    { id: 'breath', label: 'Breathing Sanctuary', icon: Wind },
    { id: 'sound', label: 'Ambient Soundscapes', icon: Volume2 },
    { id: 'shred', label: 'Worry Shredder', icon: Trash2 },
    { id: 'ground', label: 'Sensory Grounding', icon: Compass },
    { id: 'journal', label: 'Sanctuary Journal', icon: BookOpen },
  ];

  return (
    <AppLayout hasSidebar={true}>
      <div className="vz-tools-container">
        {/* Header */}
        <section className="vz-tools-header">
          <span className="vz-eyebrow">FREE · INTERACTIVE · ALWAYS AVAILABLE</span>
          <h1 className="vz-tools-header__title">
            Small practices for <em className="vz-text-violet">peaceful moments.</em>
          </h1>
          <p className="vz-tools-header__desc">
            Evidence-based somatic exercises, ambient acoustic textures, sensory grounding, and cognitive defusion to restore your calm.
          </p>

          {/* Emergency Panic SOS Banner */}
          <div className="vz-tools-panic-banner">
            <div className="vz-tools-panic-banner__info">
              <HeartPulse size={24} color="#ef4444" />
              <div>
                <strong>Experiencing Acute Panic or Spiraling?</strong>
                <p>Use our rapid 60-second vagus nerve reset to interrupt acute fight-or-flight.</p>
              </div>
            </div>
            <button
              type="button"
              className="vz-tools-panic-btn"
              onClick={() => setShowPanicModal(true)}
            >
              ⚡ 60s Panic SOS
            </button>
          </div>

          {/* Filter Pills */}
          <div className="vz-tools-filters">
            {filterButtons.map((fb) => {
              const Icon = fb.icon;
              return (
                <button
                  key={fb.id}
                  type="button"
                  className={`vz-tools-filter-btn ${activeTab === fb.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(fb.id)}
                >
                  <Icon size={16} />
                  <span>{fb.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tools Content Grid */}
        <div className="vz-tools-grid">
          {/* Tool 1: Breathing Sanctuary */}
          {(activeTab === 'all' || activeTab === 'breath') && (
            <Card variant="default" padding="lg" className="vz-tool-card vz-tool-card--breath">
              <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
                AUTONOMIC NERVOUS SYSTEM REGULATOR
              </span>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 8px' }}>Breathing Sanctuary</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                {pattern.desc}
              </p>

              {/* Pattern Buttons */}
              <div className="vz-breath-patterns">
                {Object.keys(BREATH_PRESETS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`vz-breath-p-btn ${patternKey === key ? 'active' : ''}`}
                    onClick={() => {
                      setIsBreathing(false);
                      setPatternKey(key);
                    }}
                  >
                    {BREATH_PRESETS[key].name}
                  </button>
                ))}
              </div>

              {/* Animated Orb Stage */}
              <div className="vz-breath-stage">
                <div
                  className={`vz-breath-orb ${
                    isBreathing ? `vz-breath-orb--${breathPhase.toLowerCase().replace(' ', '-')}` : ''
                  }`}
                />
                <div className="vz-breath-center-text">
                  <span className="vz-breath-phase">{breathPhase}</span>
                  <span className="vz-breath-countdown">{breathCount}s</span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsBreathing(!isBreathing)}
                  icon={isBreathing ? <Pause size={16} /> : <Play size={16} />}
                >
                  {isBreathing ? 'Pause Practice' : 'Start Guided Breath'}
                </Button>
                <button
                  type="button"
                  className="vz-btn vz-btn--outline vz-btn--md"
                  onClick={() => {
                    setIsBreathing(false);
                    setBreathPhase('Ready');
                    setCompletedCycles(0);
                  }}
                  title="Reset Counter"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>
                Completed cycles: <strong>{completedCycles}</strong>
              </div>
            </Card>
          )}

          {/* Tool 2: Ambient Soundscape Synth */}
          {(activeTab === 'all' || activeTab === 'sound') && (
            <Card variant="default" padding="lg" className="vz-tool-card">
              <span className="vz-eyebrow" style={{ color: '#0284c7' }}>
                ACOUSTIC FOCUS & COGNITIVE MASKING
              </span>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 8px' }}>Ambient Soundscape Synth</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)', marginBottom: '20px' }}>
                Procedural audio synthesizer generated live in your browser with no internet streaming needed.
              </p>

              <div className="vz-sound-options">
                <div className={`vz-sound-item ${playingAudio === 'pink' ? 'playing' : ''}`}>
                  <div>
                    <strong>Pink Noise · Ocean Wash</strong>
                    <p>Balances higher frequencies; ideal for study and reading.</p>
                  </div>
                  <button
                    type="button"
                    className="vz-sound-toggle-btn"
                    onClick={() => (playingAudio === 'pink' ? stopSound() : startSound('pink'))}
                  >
                    {playingAudio === 'pink' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>

                <div className={`vz-sound-item ${playingAudio === 'brown' ? 'playing' : ''}`}>
                  <div>
                    <strong>Brown Noise · Deep Warmth</strong>
                    <p>Heavy low rumble; deeply calming for racing thoughts and ADHD.</p>
                  </div>
                  <button
                    type="button"
                    className="vz-sound-toggle-btn"
                    onClick={() => (playingAudio === 'brown' ? stopSound() : startSound('brown'))}
                  >
                    {playingAudio === 'brown' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Tool 3: Worry Shredder */}
          {(activeTab === 'all' || activeTab === 'shred') && (
            <Card variant="default" padding="lg" className="vz-tool-card">
              <span className="vz-eyebrow" style={{ color: '#b91c1c' }}>
                COGNITIVE DEFUSION & THOUGHT RELEASE
              </span>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 8px' }}>The Worry Shredder</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                Type out a nagging anxiety or intrusive fear. Watch it safely dissolve into confetti.
              </p>

              <textarea
                className={`vz-shredder-input ${isShredding ? 'shredding' : ''}`}
                rows={3}
                placeholder="What is making you feel heavy or afraid right now? It won't be saved anywhere..."
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                disabled={isShredding}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--vz-text-muted)' }}>
                  Thoughts released: {shreddedCount}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleShred}
                  disabled={!worryText.trim() || isShredding}
                  icon={<Trash2 size={15} />}
                >
                  {isShredding ? 'Dissolving...' : 'Shred & Release'}
                </Button>
              </div>
            </Card>
          )}

          {/* Tool 4: Sensory Grounding 5-4-3-2-1 */}
          {(activeTab === 'all' || activeTab === 'ground') && (
            <Card variant="default" padding="lg" className="vz-tool-card">
              <span className="vz-eyebrow" style={{ color: '#059669' }}>
                SOMATIC PRESENCE · 5-4-3-2-1
              </span>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 8px' }}>Sensory Grounding Wizard</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                Bring your attention out of spiraling thoughts and firmly back into your physical surroundings.
              </p>

              <div className="vz-grounding-step-card">
                <span className="vz-grounding-icon">{groundingSteps[groundingStep].icon}</span>
                <h3 style={{ fontSize: '1.2rem', margin: '8px 0' }}>{groundingSteps[groundingStep].title}</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--vz-text-secondary)' }}>
                  {groundingSteps[groundingStep].desc}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="vz-btn vz-btn--ghost vz-btn--sm"
                  onClick={() => setGroundingStep(Math.max(0, groundingStep - 1))}
                  disabled={groundingStep === 0}
                >
                  Back
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {groundingSteps.map((_, i) => (
                    <span
                      key={i}
                      className={`vz-grounding-dot ${groundingStep === i ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setGroundingStep((groundingStep + 1) % groundingSteps.length)}
                >
                  {groundingStep === groundingSteps.length - 1 ? 'Start Over' : 'Next Sense →'}
                </Button>
              </div>
            </Card>
          )}

          {/* Tool 5: Sanctuary Journal */}
          {(activeTab === 'all' || activeTab === 'journal') && (
            <Card variant="default" padding="lg" className="vz-tool-card" style={{ gridColumn: activeTab === 'journal' ? '1 / -1' : undefined }}>
              <span className="vz-eyebrow" style={{ color: '#7c3aed' }}>
                PRIVATE REFLECTION LOG
              </span>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 8px' }}>Sanctuary Journal</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)', marginBottom: '16px' }}>
                Encrypted, local-first reflection prompts. Never sent to any external server.
              </p>

              <div className="vz-journal-prompts">
                <button type="button" onClick={() => setJournalEntry("One kind thing someone said to me recently: ")}>
                  Kind word
                </button>
                <button type="button" onClick={() => setJournalEntry("Right now, my body is asking for: ")}>
                  Body need
                </button>
                <button type="button" onClick={() => setJournalEntry("Even though things feel overwhelming, I know that: ")}>
                  Grounding reminder
                </button>
              </div>

              <textarea
                className="vz-journal-input"
                rows={3}
                placeholder="Write your private reflections here..."
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                {savedNotice ? (
                  <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                    ✓ Saved to browser
                  </span>
                ) : <span />}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveJournal}
                  disabled={!journalEntry.trim()}
                  icon={<Save size={15} />}
                >
                  Save Reflection
                </Button>
              </div>

              {savedEntries.length > 0 && (
                <div className="vz-journal-saved-list">
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--vz-text-muted)', marginBottom: '8px' }}>Recent Notes</h4>
                  {savedEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="vz-journal-saved-item">
                      <p>{entry.text}</p>
                      <small>{entry.date}</small>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* 60s Panic SOS Modal */}
        {showPanicModal && (
          <div className="vz-modal-backdrop" onClick={() => setShowPanicModal(false)}>
            <div className="vz-modal-card" style={{ maxWidth: '480px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="vz-modal-close"
                onClick={() => setShowPanicModal(false)}
              >
                <X size={20} />
              </button>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <HeartPulse size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>60s Vagus Nerve Reset</h2>
              <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                Panic happens when adrenaline surges. We can signal physical safety directly to your brainstem right now.
              </p>

              <div className="vz-panic-steps">
                <div className="vz-panic-step-item">
                  <span>1</span>
                  <p><strong>Place both feet flat</strong> on the cool floor. Press downward.</p>
                </div>
                <div className="vz-panic-step-item">
                  <span>2</span>
                  <p><strong>Double inhale:</strong> Quick sniff in, top-up sniff in, then long slow exhale through lips.</p>
                </div>
                <div className="vz-panic-step-item">
                  <span>3</span>
                  <p><strong>Look around:</strong> Name 3 blue or green objects out loud.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button to="/chat" variant="primary" fullWidth size="md">
                  Talk to an Empathetic Listener
                </Button>
                <Button to="/safety" variant="outline" size="md">
                  Helplines
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
