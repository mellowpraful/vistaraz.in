/**
 * Vistaraz Interactive Mental Wellness Toolkit Suite
 * High-performance, offline-capable, zero-dependency sensory & somatic tools.
 */

// ═══════════════════════════════════════════════════════════════════
// 1. BREATHING STUDIO
// ═══════════════════════════════════════════════════════════════════
const VzBreathingStudio = (() => {
  const PATTERNS = {
    box: {
      name: 'Box Breathing (4-4-4-4)',
      desc: 'Navy SEAL grounding technique to stabilize autonomic nervous system',
      phases: [
        { name: 'Inhale Slowly', dur: 4, scale: 1.45, color: 'rgba(34, 211, 238, 0.9)' },
        { name: 'Hold Gently', dur: 4, scale: 1.45, color: 'rgba(167, 139, 250, 0.9)' },
        { name: 'Exhale Completely', dur: 4, scale: 0.85, color: 'rgba(74, 222, 128, 0.9)' },
        { name: 'Rest / Hold', dur: 4, scale: 0.85, color: 'rgba(251, 146, 60, 0.9)' }
      ]
    },
    relax478: {
      name: 'Deep Sleep & Relief (4-7-8)',
      desc: 'Dr. Weil relaxation technique that stimulates vagus nerve',
      phases: [
        { name: 'Inhale through Nose', dur: 4, scale: 1.5, color: 'rgba(34, 211, 238, 0.9)' },
        { name: 'Hold Peacefully', dur: 7, scale: 1.5, color: 'rgba(167, 139, 250, 0.9)' },
        { name: 'Exhale with Whoosh', dur: 8, scale: 0.8, color: 'rgba(74, 222, 128, 0.9)' }
      ]
    },
    coherence: {
      name: 'Heart Coherence (5.5s)',
      desc: 'Harmonizes heart rate variability (HRV) for deep emotional balance',
      phases: [
        { name: 'Inhale with Ease', dur: 5.5, scale: 1.4, color: 'rgba(34, 211, 238, 0.9)' },
        { name: 'Exhale with Ease', dur: 5.5, scale: 0.85, color: 'rgba(167, 139, 250, 0.9)' }
      ]
    },
    panicReset: {
      name: 'Rapid Panic Reset (4-2-6)',
      desc: 'Quick vagal brake to stop hyperventilation and acute distress',
      phases: [
        { name: 'Breathe In Deep', dur: 4, scale: 1.4, color: 'rgba(34, 211, 238, 0.9)' },
        { name: 'Brief Pause', dur: 2, scale: 1.4, color: 'rgba(251, 146, 60, 0.9)' },
        { name: 'Long Soft Sigh', dur: 6, scale: 0.8, color: 'rgba(74, 222, 128, 0.9)' }
      ]
    }
  };

  let activePattern = 'box';
  let isRunning = false;
  let currentPhaseIdx = 0;
  let timeLeft = 4;
  let timerInterval = null;
  let cyclesCount = 0;
  let totalSeconds = 0;

  function playTone(freq = 432, type = 'sine', duration = 0.3) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function setPattern(patternKey) {
    if (!PATTERNS[patternKey]) return;
    activePattern = patternKey;
    stop();
    
    // Update pattern buttons UI
    document.querySelectorAll('.vz-pattern-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pattern === patternKey);
    });

    const descEl = document.getElementById('vzBreathDesc');
    if (descEl) descEl.textContent = PATTERNS[patternKey].desc;

    resetStage();
  }

  function resetStage() {
    currentPhaseIdx = 0;
    const pattern = PATTERNS[activePattern];
    timeLeft = pattern.phases[0].dur;
    
    const phaseText = document.getElementById('vzPhaseText');
    const timerVal = document.getElementById('vzTimerVal');
    const orb = document.getElementById('vzBreathOrb');
    
    if (phaseText) phaseText.textContent = pattern.phases[0].name;
    if (timerVal) timerVal.textContent = Math.ceil(timeLeft) + 's';
    if (orb) {
      orb.style.transform = 'scale(1)';
      orb.style.filter = 'blur(12px)';
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;

    const startBtn = document.getElementById('vzBreathStartBtn');
    if (startBtn) {
      startBtn.innerHTML = '<i class="fa-solid fa-pause" style="margin-right: 8px;"></i> Pause Practice';
      startBtn.classList.replace('primary', 'ghost');
    }

    runPhase();
  }

  function runPhase() {
    const pattern = PATTERNS[activePattern];
    const phase = pattern.phases[currentPhaseIdx];
    timeLeft = phase.dur;

    const phaseText = document.getElementById('vzPhaseText');
    const timerVal = document.getElementById('vzTimerVal');
    const orb = document.getElementById('vzBreathOrb');

    if (phaseText) phaseText.textContent = phase.name;
    if (timerVal) timerVal.textContent = Math.ceil(timeLeft) + 's';
    
    if (orb) {
      orb.style.transition = `transform ${phase.dur}s cubic-bezier(0.4, 0, 0.2, 1), background ${phase.dur}s ease`;
      orb.style.transform = `scale(${phase.scale})`;
      orb.style.background = `radial-gradient(circle, ${phase.color} 0%, rgba(167, 139, 250, 0.35) 60%, rgba(34, 211, 238, 0) 80%)`;
    }

    // Play chime at beginning of inhale or exhale
    if (phase.name.toLowerCase().includes('inhale')) {
      playTone(528, 'sine', 0.5);
    } else if (phase.name.toLowerCase().includes('exhale')) {
      playTone(396, 'sine', 0.5);
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isRunning) {
        clearInterval(timerInterval);
        return;
      }

      timeLeft -= 0.1;
      totalSeconds += 0.1;

      if (timerVal) {
        timerVal.textContent = Math.max(1, Math.ceil(timeLeft)) + 's';
      }

      const totalTimeEl = document.getElementById('vzBreathTotalTime');
      if (totalTimeEl) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        totalTimeEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }

      if (timeLeft <= 0.05) {
        clearInterval(timerInterval);
        currentPhaseIdx++;
        if (currentPhaseIdx >= pattern.phases.length) {
          currentPhaseIdx = 0;
          cyclesCount++;
          const cyclesEl = document.getElementById('vzBreathCycles');
          if (cyclesEl) cyclesEl.textContent = cyclesCount;
        }
        runPhase();
      }
    }, 100);
  }

  function pause() {
    isRunning = false;
    clearInterval(timerInterval);
    const startBtn = document.getElementById('vzBreathStartBtn');
    if (startBtn) {
      startBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-right: 8px;"></i> Resume Practice';
      startBtn.classList.replace('ghost', 'primary');
    }
  }

  function toggle() {
    if (isRunning) pause();
    else start();
  }

  function stop() {
    isRunning = false;
    clearInterval(timerInterval);
    const startBtn = document.getElementById('vzBreathStartBtn');
    if (startBtn) {
      startBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-right: 8px;"></i> Start Exercise';
      startBtn.classList.replace('ghost', 'primary');
    }
    resetStage();
  }

  return { setPattern, toggle, start, pause, stop };
})();


// ═══════════════════════════════════════════════════════════════════
// 2. NATIVE WEB AUDIO AMBIENT SOUNDSCAPE SYNTH
// ═══════════════════════════════════════════════════════════════════
const VzSoundscapeSynth = (() => {
  let audioCtx = null;
  const activeNodes = {};
  let timerTimeout = null;

  function getContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Generates 5 seconds of pink noise buffer
  function createPinkNoiseBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Generates 5 seconds of brown noise buffer (warm waves & rain)
  function createBrownNoiseBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain boost
    }
    return buffer;
  }

  function startRain(ctx, gainNode) {
    const noise = ctx.createBufferSource();
    noise.buffer = createPinkNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();
    return [noise, filter];
  }

  function startWaves(ctx, gainNode) {
    const noise = ctx.createBufferSource();
    noise.buffer = createBrownNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    // LFO to create rhythmic tide surging
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec ocean surge
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(260, ctx.currentTime);
    lfo.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();
    lfo.start();
    return [noise, filter, lfo];
  }

  function startDrone(ctx, gainNode) {
    // 432Hz Om Binaural harmonic drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.frequency.setValueAtTime(108, ctx.currentTime);
    osc2.frequency.setValueAtTime(216, ctx.currentTime);
    osc3.frequency.setValueAtTime(432, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.18, ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    osc3.connect(subGain);
    subGain.connect(gainNode);

    osc1.start();
    osc2.start();
    osc3.start();
    return [osc1, osc2, osc3, subGain];
  }

  function startFire(ctx, gainNode) {
    const noise = ctx.createBufferSource();
    noise.buffer = createBrownNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();
    return [noise, filter];
  }

  function startWind(ctx, gainNode) {
    const noise = ctx.createBufferSource();
    noise.buffer = createPinkNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(350, ctx.currentTime);
    lfo.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();
    lfo.start();
    return [noise, filter, lfo];
  }

  function toggleSound(soundKey) {
    const ctx = getContext();
    const card = document.getElementById('card-' + soundKey);
    const slider = document.getElementById('vol-' + soundKey);
    const vol = slider ? parseFloat(slider.value) : 0.5;

    if (activeNodes[soundKey]) {
      // Stop
      activeNodes[soundKey].nodes.forEach(n => {
        try { n.stop(); } catch (e) {}
        try { n.disconnect(); } catch (e) {}
      });
      delete activeNodes[soundKey];
      if (card) card.classList.remove('playing');
    } else {
      // Start
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(vol * 0.35, ctx.currentTime);
      gainNode.connect(ctx.destination);

      let nodes = [];
      if (soundKey === 'rain') nodes = startRain(ctx, gainNode);
      else if (soundKey === 'waves') nodes = startWaves(ctx, gainNode);
      else if (soundKey === 'drone') nodes = startDrone(ctx, gainNode);
      else if (soundKey === 'fire') nodes = startFire(ctx, gainNode);
      else if (soundKey === 'wind') nodes = startWind(ctx, gainNode);

      nodes.push(gainNode);
      activeNodes[soundKey] = { gainNode, nodes };
      if (card) card.classList.add('playing');
    }
  }

  function setVolume(soundKey, val) {
    if (activeNodes[soundKey] && activeNodes[soundKey].gainNode && audioCtx) {
      activeNodes[soundKey].gainNode.gain.setValueAtTime(parseFloat(val) * 0.35, audioCtx.currentTime);
    }
  }

  function stopAll() {
    Object.keys(activeNodes).forEach(k => {
      toggleSound(k);
    });
  }

  function setSleepTimer(minutes) {
    clearTimeout(timerTimeout);
    document.querySelectorAll('.vz-timer-pill').forEach(p => p.classList.remove('active'));
    
    if (minutes <= 0) return;
    
    const pill = document.getElementById('timer-' + minutes);
    if (pill) pill.classList.add('active');

    timerTimeout = setTimeout(() => {
      stopAll();
      document.querySelectorAll('.vz-timer-pill').forEach(p => p.classList.remove('active'));
      if (window.VzNetwork) {
        // Show gentle notification
        alert('Soundscape sleep timer completed. Rest peacefully.');
      }
    }, minutes * 60 * 1000);
  }

  return { toggleSound, setVolume, stopAll, setSleepTimer };
})();


// ═══════════════════════════════════════════════════════════════════
// 3. THOUGHT DEFUSION & WORRY SHREDDER
// ═══════════════════════════════════════════════════════════════════
const VzWorryShredder = (() => {
  const REFRAMES = [
    "Thoughts are temporary clouds passing through your sky. You are the vast sky, not the storm.",
    "Acknowledging this thought gives you freedom over it. You have safely released its grip.",
    "This moment does not define your entire journey. Take a gentle breath into the space you just created.",
    "You don't have to believe everything your anxious mind whispers. You are safe here.",
    "Whatever weighs on you, you don't have to carry it all today. Honor your pace.",
    "Notice how your breath returns when you let go. You are resilient."
  ];

  function releaseWorry(mode = 'stardust') {
    const input = document.getElementById('vzWorryText');
    const text = input ? input.value.trim() : '';

    if (!text) {
      if (input) {
        input.placeholder = 'Please write a thought or worry first to release it…';
        input.focus();
      }
      return;
    }

    const canvas = document.getElementById('vzWorryCanvas');
    if (canvas) {
      canvas.style.display = 'block';
      animateParticles(canvas, mode);
    }

    if (input) {
      input.value = '';
      input.style.opacity = '0.3';
      setTimeout(() => {
        input.style.opacity = '1';
        input.placeholder = 'Write down any heavy thought, anxiety, or doubt…';
      }, 1000);
    }

    const reframingBox = document.getElementById('vzWorryReframe');
    const reframingMsg = document.getElementById('vzWorryReframeMsg');
    if (reframingBox && reframingMsg) {
      const randomMsg = REFRAMES[Math.floor(Math.random() * REFRAMES.length)];
      reframingMsg.textContent = randomMsg;
      reframingBox.style.display = 'block';
    }
  }

  function animateParticles(canvas, mode) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const particles = [];
    const count = 90;
    const colors = mode === 'stardust' 
      ? ['#22d3ee', '#a78bfa', '#f472b6', '#ffffff'] 
      : ['#fb923c', '#f87171', '#fbbf24', '#ffffff'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 140,
        y: canvas.height / 2 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.8) * 5,
        size: Math.random() * 4 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(render);
      } else {
        canvas.style.display = 'none';
      }
    }

    render();
  }

  return { releaseWorry };
})();


// ═══════════════════════════════════════════════════════════════════
// 4. 5-4-3-2-1 SENSORY GROUNDING WIZARD
// ═══════════════════════════════════════════════════════════════════
const VzGroundingWizard = (() => {
  const STEPS = [
    {
      num: 5,
      sense: 'Sight',
      title: '5 Things You Can SEE',
      desc: 'Look around your room or space. Notice five specific visual items or details.',
      chips: ['A shadow on the wall', 'A pattern on fabric', 'A point of light', 'An object with color', 'A detail you never noticed']
    },
    {
      num: 4,
      sense: 'Touch',
      title: '4 Things You Can FEEL',
      desc: 'Focus on physical contact. Feel the sensations touching your body right now.',
      chips: ['Feet firm on the ground', 'Texture of your clothing', 'Temperature of the air', 'Weight of hands in your lap']
    },
    {
      num: 3,
      sense: 'Hearing',
      title: '3 Things You Can HEAR',
      desc: 'Close your eyes for a moment. Listen carefully to the subtle sounds around you.',
      chips: ['Distant traffic or hum', 'Your gentle breath', 'Clock ticking or fan', 'Birds or breeze outside']
    },
    {
      num: 2,
      sense: 'Smell',
      title: '2 Things You Can SMELL',
      desc: 'Take a slow, deep inhale. Identify two subtle aromas or recall a comforting scent.',
      chips: ['Fresh room air', 'Coffee or tea', 'Scent of soap or cloth', 'Favorite calming scent']
    },
    {
      num: 1,
      sense: 'Taste / Gratitude',
      title: '1 Thing You Can TASTE or AFFIRM',
      desc: 'Notice any lingering taste in your mouth, or state one kind truth about yourself.',
      chips: ['"I am safe in this moment"', 'Cool sip of water', '"I am doing the best I can"', 'A soothing mint or tea']
    }
  ];

  let currentStepIdx = 0;

  function renderStep() {
    const step = STEPS[currentStepIdx];
    const titleEl = document.getElementById('vzGroundingTitle');
    const descEl = document.getElementById('vzGroundingDesc');
    const chipsContainer = document.getElementById('vzGroundingChips');
    const progressEl = document.getElementById('vzGroundingProgressBar');
    const stepNumBadge = document.getElementById('vzGroundingBadge');

    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (stepNumBadge) stepNumBadge.textContent = `Step ${currentStepIdx + 1} of 5 · ${step.sense}`;

    if (progressEl) {
      progressEl.style.width = ((currentStepIdx + 1) / 5 * 100) + '%';
    }

    if (chipsContainer) {
      chipsContainer.innerHTML = '';
      step.chips.forEach((chipText, i) => {
        const btn = document.createElement('button');
        btn.className = 'vz-sensory-chip';
        btn.textContent = chipText;
        btn.onclick = () => {
          btn.classList.toggle('checked');
        };
        chipsContainer.appendChild(btn);
      });
    }

    const prevBtn = document.getElementById('vzGroundingPrevBtn');
    const nextBtn = document.getElementById('vzGroundingNextBtn');
    if (prevBtn) prevBtn.style.visibility = currentStepIdx === 0 ? 'hidden' : 'visible';
    if (nextBtn) {
      nextBtn.innerHTML = currentStepIdx === 4 
        ? '<i class="fa-solid fa-check" style="margin-right: 6px;"></i> Complete Grounding' 
        : 'Next Step <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i>';
    }
  }

  function next() {
    if (currentStepIdx < 4) {
      currentStepIdx++;
      renderStep();
    } else {
      // Completed
      const box = document.getElementById('vzGroundingCard');
      if (box) {
        box.innerHTML = `
          <div style="text-align: center; padding: 20px 10px;">
            <div style="font-size: 2.4rem; color: var(--success); margin-bottom: 12px;"><i class="fa-solid fa-circle-check"></i></div>
            <h3 style="margin-bottom: 8px;">You Are Grounded & Present</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 480px; margin: 0 auto 20px auto;">
              You have successfully engaged all five senses. Your mind is anchored firmly in the safety of the present moment.
            </p>
            <button class="button primary" onclick="VzGroundingWizard.reset()"><i class="fa-solid fa-rotate-right" style="margin-right: 6px;"></i> Practice Again</button>
          </div>
        `;
      }
    }
  }

  function prev() {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      renderStep();
    }
  }

  function reset() {
    currentStepIdx = 0;
    location.reload();
  }

  return { renderStep, next, prev, reset };
})();


// ═══════════════════════════════════════════════════════════════════
// 5. SOMATIC BODY SCAN & MUSCLE TENSION RELEASE
// ═══════════════════════════════════════════════════════════════════
const VzBodyScan = (() => {
  const ZONES = [
    { id: 'face', name: 'Face, Forehead & Jaw', tip: 'Unclench your teeth, soften your eyebrow ridge, drop tongue from roof of mouth.' },
    { id: 'shoulders', name: 'Neck & Shoulders', tip: 'Drop your shoulders down and away from ears. Let shoulder blades melt back.' },
    { id: 'chest', name: 'Chest & Breathing', tip: 'Take a gentle breath into the belly. Allow ribs to expand effortlessly without forcing.' },
    { id: 'hands', name: 'Hands & Arms', tip: 'Uncurl your fingers. Let warmth and heavy relaxation flow into palms.' },
    { id: 'belly', name: 'Abdomen & Core', tip: 'Release any held abdominal tension. Let your belly soften completely.' },
    { id: 'legs', name: 'Legs & Feet', tip: 'Release tightness in thighs and calves. Feel connection with the floor beneath you.' }
  ];

  let currentZoneIdx = 0;
  let timer = null;
  let countdown = 5;
  let phase = 'idle'; // 'idle' | 'tense' | 'release'

  function selectZone(idx) {
    currentZoneIdx = idx;
    const zone = ZONES[idx];
    document.querySelectorAll('.vz-body-zone-btn').forEach((b, i) => {
      b.classList.toggle('active', i === idx);
    });

    const title = document.getElementById('vzBodyZoneTitle');
    const tip = document.getElementById('vzBodyZoneTip');
    if (title) title.textContent = zone.name;
    if (tip) tip.textContent = zone.tip;

    const actionBtn = document.getElementById('vzBodyActionBtn');
    if (actionBtn) {
      actionBtn.textContent = 'Start 5s Tension & Release';
      actionBtn.classList.remove('ghost');
      actionBtn.classList.add('primary');
    }
  }

  function startTensionRelease() {
    clearInterval(timer);
    const actionBtn = document.getElementById('vzBodyActionBtn');
    const statusText = document.getElementById('vzBodyStatusText');
    const activeBtn = document.querySelectorAll('.vz-body-zone-btn')[currentZoneIdx];

    phase = 'tense';
    countdown = 5;

    if (statusText) statusText.textContent = `Tense ${ZONES[currentZoneIdx].name} gently for ${countdown}s...`;
    if (actionBtn) {
      actionBtn.textContent = `Tensing (${countdown}s)`;
      actionBtn.classList.replace('primary', 'ghost');
    }

    timer = setInterval(() => {
      countdown--;
      if (phase === 'tense') {
        if (actionBtn) actionBtn.textContent = `Tensing (${countdown}s)`;
        if (statusText) statusText.textContent = `Tense gently... ${countdown}s remaining`;

        if (countdown <= 0) {
          phase = 'release';
          countdown = 10;
          if (statusText) statusText.textContent = `Release and soften completely! Feel the tension draining away for ${countdown}s...`;
          if (actionBtn) actionBtn.textContent = `Softening (${countdown}s)`;
        }
      } else if (phase === 'release') {
        if (actionBtn) actionBtn.textContent = `Softening (${countdown}s)`;
        if (statusText) statusText.textContent = `Softening and relaxing... ${countdown}s remaining`;

        if (countdown <= 0) {
          clearInterval(timer);
          phase = 'idle';
          if (activeBtn) activeBtn.classList.add('completed');
          if (statusText) statusText.textContent = `✅ ${ZONES[currentZoneIdx].name} relaxed and released.`;
          if (actionBtn) {
            actionBtn.textContent = 'Next Muscle Group →';
            actionBtn.classList.replace('ghost', 'primary');
            actionBtn.onclick = () => {
              if (currentZoneIdx < ZONES.length - 1) {
                selectZone(currentZoneIdx + 1);
              } else {
                selectZone(0);
              }
              actionBtn.onclick = startTensionRelease;
            };
          }
        }
      }
    }, 1000);
  }

  return { selectZone, startTensionRelease };
})();


// ═══════════════════════════════════════════════════════════════════
// 6. PRIVATE ENCRYPTED SANCTUARY JOURNAL
// ═══════════════════════════════════════════════════════════════════
const VzSanctuaryJournal = (() => {
  const STORAGE_KEY = 'vz_private_journal_entries';

  const PROMPTS = [
    "What is taking up emotional space in your heart today?",
    "What is one small thing that brought comfort or ease recently?",
    "If you could offer your tired mind one sentence of compassion, what would it be?",
    "What is a boundary you need to protect for your own peace today?",
    "Write down three things you can forgive yourself for today.",
    "Describe a safe sanctuary place in detail—what does it look and feel like?",
    "What strength helped you navigate today that you don't give yourself credit for?",
    "What would feel nourishing for your mind or body right now?"
  ];

  let selectedMood = 7;

  function setMood(score) {
    selectedMood = score;
    document.querySelectorAll('.vz-mood-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.score) === score);
    });
  }

  function randomPrompt() {
    const promptEl = document.getElementById('vzJournalPromptText');
    if (promptEl) {
      const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      promptEl.textContent = p;
    }
  }

  function getEntries() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEntry() {
    const textEl = document.getElementById('vzJournalText');
    const text = textEl ? textEl.value.trim() : '';

    if (!text) {
      if (textEl) {
        textEl.placeholder = 'Please write a few words first before saving…';
        textEl.focus();
      }
      return;
    }

    const entries = getEntries();
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood,
      content: text
    };

    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    if (textEl) textEl.value = '';
    renderEntries();

    const saveSuccess = document.getElementById('vzJournalSavedBadge');
    if (saveSuccess) {
      saveSuccess.style.display = 'inline-block';
      setTimeout(() => { saveSuccess.style.display = 'none'; }, 3000);
    }
  }

  function deleteEntry(id) {
    if (!confirm('Are you sure you wish to delete this private reflection?')) return;
    let entries = getEntries();
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    renderEntries();
  }

  function exportEntries() {
    const entries = getEntries();
    if (entries.length === 0) {
      alert('No journal entries saved yet to export.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vistaraz_reflections_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function renderEntries() {
    const container = document.getElementById('vzJournalList');
    if (!container) return;

    const entries = getEntries();
    if (entries.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">
          <i class="fa-solid fa-feather-pointed" style="font-size: 1.4rem; margin-bottom: 8px; opacity: 0.5;"></i>
          <p style="margin: 0;">No reflections saved yet. Your private notes stay encrypted only on this device.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = entries.slice(0, 5).map(e => `
      <div class="vz-journal-entry-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.78rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(34, 211, 238, 0.15); color: var(--teal-300);">Mood: ${e.mood}/10</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${e.displayDate}</span>
          </div>
          <button onclick="VzSanctuaryJournal.deleteEntry(${e.id})" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem;" title="Delete entry">&times;</button>
        </div>
        <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: var(--text-main); white-space: pre-wrap; line-height: 1.5;">${e.content}</p>
      </div>
    `).join('');
  }

  return { setMood, randomPrompt, saveEntry, deleteEntry, exportEntries, renderEntries };
})();


// ═══════════════════════════════════════════════════════════════════
// 7. 60-SECOND EMERGENCY PANIC SOS RESET
// ═══════════════════════════════════════════════════════════════════
const VzPanicSOS = (() => {
  function openModal() {
    const modal = document.getElementById('vzPanicModal');
    if (modal) modal.classList.add('open');
  }

  function closeModal() {
    const modal = document.getElementById('vzPanicModal');
    if (modal) modal.classList.remove('open');
  }

  return { openModal, closeModal };
})();


// Filter tools by category
function vzFilterTools(category, btn) {
  document.querySelectorAll('.vz-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('[data-tool-cat]');
  cards.forEach(card => {
    const cats = card.dataset.toolCat.split(' ');
    if (category === 'all' || cats.includes(category)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Global initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof VzGroundingWizard !== 'undefined') VzGroundingWizard.renderStep();
  if (typeof VzSanctuaryJournal !== 'undefined') {
    VzSanctuaryJournal.renderEntries();
    VzSanctuaryJournal.randomPrompt();
  }
});
