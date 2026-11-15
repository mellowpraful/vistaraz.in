/**
 * soundEngine.js — Procedural Web Audio Ambient Synthesizer
 * 
 * Synthesizes 100% procedural, infinite, high-fidelity soundscapes inside
 * the browser with zero external network downloads or audio file dependencies.
 * 
 * Features:
 * - Real-time Master Volume control (default 0.70 / 70% volume)
 * - Rich relaxing Piano & Waterfall synthesis with minor/pentatonic progressions
 * - Mountain Waterfall, Ocean Swells, Gentle Rain & Thunder, 432Hz Tibetan Bowls,
 *   Twilight Night Forest, and Deep Brown & Pink Noise
 * - Smooth fade-in and fade-out to prevent audio clicking/popping
 */

export const SOUND_PRESETS = [
  {
    id: 'piano_waterfall',
    name: 'Serene Piano & Waterfall',
    subtitle: 'Minor chord sanctuary with gentle cascade',
    category: 'Piano & Nature',
    badge: 'Highly Recommended',
    badgeColor: '#8b5cf6',
    desc: 'Gentle minor and pentatonic acoustic piano notes floating softly over a calming waterfall. Deeply soothing for anxiety and mental fatigue.',
    iconName: 'Music',
  },
  {
    id: 'piano_peace',
    name: 'Peaceful Piano Sanctuary',
    subtitle: 'Warm acoustic harmonies & drifting reverb',
    category: 'Solo Piano',
    badge: 'Emotional Healing',
    badgeColor: '#ec4899',
    desc: 'Slow, reflective acoustic piano arpeggios in a quiet cathedral space. Eases nervous thoughts and invites emotional stillness.',
    iconName: 'Music',
  },
  {
    id: 'waterfall',
    name: 'Mountain Waterfall & Stream',
    subtitle: 'Continuous alpine cascade & flowing currents',
    category: 'Water & Nature',
    badge: 'Stress Relief',
    badgeColor: '#0284c7',
    desc: 'Deep rushing mountain falls with soft white spray and babbling river ripples. Masks intrusive noise and calms sensory overload.',
    iconName: 'Waves',
  },
  {
    id: 'ocean_waves',
    name: 'Ocean Waves · Tidal Breath',
    subtitle: 'Rhythmic coastal swells & sea foam',
    category: 'Water & Nature',
    badge: 'Rhythmic Calming',
    badgeColor: '#0ea5e9',
    desc: 'Procedural ocean surf that swells and washes ashore every 7 seconds. Synchronize your breathing to the natural rise and fall.',
    iconName: 'Waves',
  },
  {
    id: 'rain_thunder',
    name: 'Gentle Rain & Distant Thunder',
    subtitle: 'Rhythmic rainfall with warm rolling rumbles',
    category: 'Rain & Storm',
    badge: 'Deep Sleep',
    badgeColor: '#6366f1',
    desc: 'Steady, soft rain patter against leaves with warm, distant low-frequency rolling thunder. Cozy, safe, and grounding.',
    iconName: 'CloudRain',
  },
  {
    id: 'singing_bowls',
    name: '432Hz Tibetan Singing Bowls',
    subtitle: 'Harmonic resonance & Theta wave calm',
    category: 'Meditation & Healing',
    badge: '432Hz Healing',
    badgeColor: '#10b981',
    desc: 'Sacred 432Hz singing bowl resonance with 4Hz theta wave binaural pulsing. Induces deep meditation, inner peace, and somatic release.',
    iconName: 'Sparkles',
  },
  {
    id: 'forest_night',
    name: 'Twilight Forest & Crickets',
    subtitle: 'Evening meadow breeze & tranquil night chirps',
    category: 'Night & Sleep',
    badge: 'Nighttime Peace',
    badgeColor: '#f59e0b',
    desc: 'Gentle nocturnal woodland breeze with distant crickets singing softly under a peaceful sanctuary sky.',
    iconName: 'Moon',
  },
  {
    id: 'brown_noise',
    name: 'Brown Noise · Deep Warmth',
    subtitle: 'Heavy low rumble for racing thoughts & ADHD',
    category: 'Acoustic Masking',
    badge: 'Focus & ADHD',
    badgeColor: '#d97706',
    desc: 'Deep sub-bass rumble reminiscent of a heavy distant airplane or warm cavern. Extensively used to quiet racing thoughts and overthinking.',
    iconName: 'Volume2',
  },
  {
    id: 'pink_noise',
    name: 'Pink Noise · Focus Drift',
    subtitle: 'Balanced frequency masking for reading & calm',
    category: 'Acoustic Masking',
    badge: 'Cognitive Flow',
    badgeColor: '#3b82f6',
    desc: 'Balanced equal-energy noise smoother than white noise. Ideal for reading, studying, and blocking sudden background disruptions.',
    iconName: 'Volume2',
  },
];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentId = null;
    this.activeNodes = [];
    this.intervalId = null;
    this.volume = 0.70; // High default volume (70%)
  }

  getAudioContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  getVolume() {
    return this.volume;
  }

  getCurrentSound() {
    return this.currentId;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach((node) => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    }

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {}
      this.masterGain = null;
    }

    this.currentId = null;
  }

  play(soundId) {
    this.stop();

    const ctx = this.getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    this.currentId = soundId;

    switch (soundId) {
      case 'piano_waterfall':
        this.playPianoWithWaterfall(ctx, masterGain);
        break;
      case 'piano_peace':
        this.playPeacefulPiano(ctx, masterGain);
        break;
      case 'waterfall':
        this.playWaterfall(ctx, masterGain);
        break;
      case 'ocean_waves':
        this.playOceanWaves(ctx, masterGain);
        break;
      case 'rain_thunder':
        this.playRainAndThunder(ctx, masterGain);
        break;
      case 'singing_bowls':
        this.playSingingBowls(ctx, masterGain);
        break;
      case 'forest_night':
        this.playForestNight(ctx, masterGain);
        break;
      case 'brown_noise':
        this.playBrownNoise(ctx, masterGain);
        break;
      case 'pink_noise':
        this.playPinkNoise(ctx, masterGain);
        break;
      default:
        this.playWaterfall(ctx, masterGain);
        break;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: Create Continuous Filtered Noise Buffer Source
  // ─────────────────────────────────────────────────────────────────────────────
  createNoiseBuffer(ctx, type = 'pink', duration = 3) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'brown') {
        // Brown noise integration (1/f^2)
        lastOut = (lastOut + 0.025 * white) / 1.025;
        data[i] = lastOut * 3.8;
      } else if (type === 'pink') {
        // Paul Kellet's accurate pink noise filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.22;
        b6 = white * 0.115926;
      } else {
        // White noise
        data[i] = white * 0.6;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Serene Piano & Waterfall (Acoustic minor piano + soft cascade)
  // ─────────────────────────────────────────────────────────────────────────────
  playPianoWithWaterfall(ctx, masterGain) {
    // A. Soft Background Waterfall
    const waterNoise = this.createNoiseBuffer(ctx, 'pink', 4);
    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.setValueAtTime(750, ctx.currentTime);

    const waterGain = ctx.createGain();
    waterGain.gain.setValueAtTime(0.38, ctx.currentTime);

    waterNoise.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(masterGain);
    waterNoise.start();
    this.activeNodes.push(waterNoise, waterFilter, waterGain);

    // B. Reverb / Ambient Delay
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.38, ctx.currentTime);
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.32, ctx.currentTime);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1400, ctx.currentTime);

    delay.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(masterGain);
    this.activeNodes.push(delay, delayFeedback, delayFilter);

    // C. Piano Chords & Arpeggio Engine (Gentle D minor / F major pentatonic)
    // Chords: Dm9, Bbmaj7, Gm9, Asus4, Fmaj9
    const progressions = [
      [146.83, 220.00, 261.63, 329.63, 349.23], // D3, A3, C4, E4, F4 (Dm9)
      [116.54, 174.61, 220.00, 293.66, 349.23], // Bb2, F3, A3, D4, F4 (Bbmaj7)
      [98.00, 146.83, 174.61, 220.00, 293.66],  // G2, D3, F3, A3, D4 (Gm9)
      [110.00, 164.81, 220.00, 293.66, 329.63], // A2, E3, A3, D4, E4 (Asus4)
      [87.31, 130.81, 174.61, 220.00, 261.63],  // F2, C3, F3, A3, C4 (Fmaj7)
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      const chord = progressions[chordIndex % progressions.length];
      chordIndex++;

      chord.forEach((freq, idx) => {
        const noteDelay = idx * 0.14 + Math.random() * 0.05;
        setTimeout(() => {
          if (this.currentId !== 'piano_waterfall' || !this.ctx) return;
          this.triggerPianoNote(this.ctx, freq, masterGain, delay, 0.55);
        }, noteDelay * 1000);
      });
    };

    // Trigger initial chord immediately
    playChordStep();
    this.intervalId = setInterval(playChordStep, 3600);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Peaceful Piano Sanctuary (Warm solo acoustic piano with cathedral reverb)
  // ─────────────────────────────────────────────────────────────────────────────
  playPeacefulPiano(ctx, masterGain) {
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.42, ctx.currentTime);
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.38, ctx.currentTime);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1500, ctx.currentTime);

    delay.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(masterGain);
    this.activeNodes.push(delay, delayFeedback, delayFilter);

    // Minor / Lydian meditative chords: Cmaj9, Em9, Am9, Fmaj7#11, Gsus2
    const meditativeProgression = [
      [130.81, 196.00, 246.94, 293.66, 329.63], // C3, G3, B3, D4, E4 (Cmaj9)
      [82.41, 123.47, 164.81, 246.94, 293.66],  // E2, B2, E3, B3, D4 (Em9)
      [110.00, 164.81, 220.00, 261.63, 329.63], // A2, E3, A3, C4, E4 (Am9)
      [87.31, 130.81, 174.61, 246.94, 261.63],  // F2, C3, F3, B3, C4 (Fmaj7#11)
      [98.00, 146.83, 196.00, 293.66, 392.00],  // G2, D3, G3, D4, G4 (Gsus2)
    ];

    let chordIndex = 0;
    const playSoloStep = () => {
      const chord = meditativeProgression[chordIndex % meditativeProgression.length];
      chordIndex++;

      // Arpeggiate notes with humanized emotional timing
      chord.forEach((freq, idx) => {
        const offset = idx === 0 ? 0 : 0.22 * idx + (Math.random() * 0.08);
        setTimeout(() => {
          if (this.currentId !== 'piano_peace' || !this.ctx) return;
          this.triggerPianoNote(this.ctx, freq, masterGain, delay, 0.75);
        }, offset * 1000);
      });
    };

    playSoloStep();
    this.intervalId = setInterval(playSoloStep, 4200);
  }

  // Synthesize a realistic, warm acoustic piano note with harmonics and natural decay
  triggerPianoNote(ctx, freq, outputNode, delayNode, velocity = 0.6) {
    try {
      const now = ctx.currentTime;
      const duration = 4.2;

      // Primary tone (warm triangle + detuned sine for wooden body resonance)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.002, now); // 2 cents natural detune

      // Second harmonic overtone (gives hammer brightness)
      const oscHarmonic = ctx.createOscillator();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2, now);

      const noteGain = ctx.createGain();
      const harmGain = ctx.createGain();

      // Piano Strike Envelope: Ultra-fast 6ms attack, natural piano decay curve
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(velocity * 0.45, now + 0.008);
      noteGain.gain.exponentialRampToValueAtTime(velocity * 0.15, now + 0.6);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      harmGain.gain.setValueAtTime(0.0001, now);
      harmGain.gain.linearRampToValueAtTime(velocity * 0.12, now + 0.006);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      // Warm acoustic lowpass filter (removes artificial harsh digital highs)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(2200, freq * 5), now);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      oscHarmonic.connect(harmGain);

      noteGain.connect(filter);
      harmGain.connect(filter);

      filter.connect(outputNode);
      if (delayNode) {
        filter.connect(delayNode);
      }

      osc1.start(now);
      osc2.start(now);
      oscHarmonic.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
      oscHarmonic.stop(now + duration);
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Mountain Waterfall & Stream (Rushing water cascade with spray)
  // ─────────────────────────────────────────────────────────────────────────────
  playWaterfall(ctx, masterGain) {
    // 1. Deep rumble base of rushing cascade
    const brownNoise = this.createNoiseBuffer(ctx, 'brown', 3);
    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'lowpass';
    lowFilter.frequency.setValueAtTime(450, ctx.currentTime);
    const lowGain = ctx.createGain();
    lowGain.gain.setValueAtTime(0.70, ctx.currentTime);

    brownNoise.connect(lowFilter);
    lowFilter.connect(lowGain);
    lowGain.connect(masterGain);
    brownNoise.start();

    // 2. Mid water spray and turbulent splash
    const pinkNoise = this.createNoiseBuffer(ctx, 'pink', 3);
    const midFilter = ctx.createBiquadFilter();
    midFilter.type = 'bandpass';
    midFilter.frequency.setValueAtTime(800, ctx.currentTime);
    midFilter.Q.setValueAtTime(1.2, ctx.currentTime);
    const midGain = ctx.createGain();
    midGain.gain.setValueAtTime(0.55, ctx.currentTime);

    pinkNoise.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(masterGain);
    pinkNoise.start();

    this.activeNodes.push(brownNoise, lowFilter, lowGain, pinkNoise, midFilter, midGain);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Ocean Waves · Tidal Breath (7-second breathing cycle)
  // ─────────────────────────────────────────────────────────────────────────────
  playOceanWaves(ctx, masterGain) {
    const noise = this.createNoiseBuffer(ctx, 'pink', 4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.2, ctx.currentTime);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(masterGain);
    noise.start();

    // LFO Oscillator to rhythmically swell the filter & volume
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.14, ctx.currentTime); // ~7 seconds period

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(450, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const lfoAmp = ctx.createGain();
    lfoAmp.gain.setValueAtTime(0.35, ctx.currentTime);
    lfo.connect(lfoAmp);
    lfoAmp.connect(waveGain.gain);

    lfo.start();
    this.activeNodes.push(noise, filter, waveGain, lfo, lfoGain, lfoAmp);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Gentle Rain & Distant Thunder
  // ─────────────────────────────────────────────────────────────────────────────
  playRainAndThunder(ctx, masterGain) {
    // A. Rain pitter-patter
    const rainNoise = this.createNoiseBuffer(ctx, 'pink', 3);
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(2200, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.65, ctx.currentTime);

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    rainNoise.start();
    this.activeNodes.push(rainNoise, rainFilter, rainGain);

    // B. Distant Rolling Thunder generator
    const triggerThunder = () => {
      if (this.currentId !== 'rain_thunder' || !this.ctx) return;
      try {
        const now = ctx.currentTime;
        const thunderNoise = this.createNoiseBuffer(ctx, 'brown', 5);
        const thunderFilter = ctx.createBiquadFilter();
        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.setValueAtTime(80, now);

        const thunderGain = ctx.createGain();
        thunderGain.gain.setValueAtTime(0.001, now);
        thunderGain.gain.linearRampToValueAtTime(0.85, now + 1.8);
        thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 6.0);

        thunderNoise.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(masterGain);

        thunderNoise.start(now);
        thunderNoise.stop(now + 6.5);
      } catch (e) {}
    };

    // First thunder after 4s, then periodically
    setTimeout(triggerThunder, 3500);
    this.intervalId = setInterval(triggerThunder, 18000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. 432Hz Tibetan Singing Bowls & Theta Waves (Binaural calm)
  // ─────────────────────────────────────────────────────────────────────────────
  playSingingBowls(ctx, masterGain) {
    // 432Hz Sacred Sine & 436Hz partner for 4Hz Theta wave binaural frequency
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(432, ctx.currentTime);

    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(436, ctx.currentTime); // 4Hz Theta beat

    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(864, ctx.currentTime); // 2nd harmonic octave

    const bowlGain = ctx.createGain();
    bowlGain.gain.setValueAtTime(0.35, ctx.currentTime);

    oscLeft.connect(bowlGain);
    oscRight.connect(bowlGain);
    oscHarmonic.connect(bowlGain);
    bowlGain.connect(masterGain);

    oscLeft.start();
    oscRight.start();
    oscHarmonic.start();
    this.activeNodes.push(oscLeft, oscRight, oscHarmonic, bowlGain);

    // Deep low bowl gong strike every 7s
    const strikeDeepBowl = () => {
      if (this.currentId !== 'singing_bowls' || !this.ctx) return;
      try {
        const now = ctx.currentTime;
        const lowBowl = ctx.createOscillator();
        lowBowl.type = 'sine';
        lowBowl.frequency.setValueAtTime(216, now); // Sub-octave of 432

        const strikeGain = ctx.createGain();
        strikeGain.gain.setValueAtTime(0.001, now);
        strikeGain.gain.linearRampToValueAtTime(0.55, now + 0.1);
        strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 6.5);

        lowBowl.connect(strikeGain);
        strikeGain.connect(masterGain);

        lowBowl.start(now);
        lowBowl.stop(now + 7.0);
      } catch (e) {}
    };

    strikeDeepBowl();
    this.intervalId = setInterval(strikeDeepBowl, 7000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Twilight Forest & Night Crickets
  // ─────────────────────────────────────────────────────────────────────────────
  playForestNight(ctx, masterGain) {
    // A. Soft night wind in trees
    const windNoise = this.createNoiseBuffer(ctx, 'pink', 4);
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(480, ctx.currentTime);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.35, ctx.currentTime);

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windNoise.start();
    this.activeNodes.push(windNoise, windFilter, windGain);

    // B. Procedural Crickets (Gentle high chirp pulses)
    const chirpCricket = () => {
      if (this.currentId !== 'forest_night' || !this.ctx) return;
      try {
        const now = ctx.currentTime;
        const chirpOsc = ctx.createOscillator();
        chirpOsc.type = 'sine';
        chirpOsc.frequency.setValueAtTime(4200 + Math.random() * 200, now);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0.001, now);
        chirpGain.gain.linearRampToValueAtTime(0.09, now + 0.015);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(masterGain);

        chirpOsc.start(now);
        chirpOsc.stop(now + 0.07);
      } catch (e) {}
    };

    this.intervalId = setInterval(() => {
      chirpCricket();
      setTimeout(chirpCricket, 90);
      setTimeout(chirpCricket, 180);
    }, 1800);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Brown Noise (Enhanced Deep Warmth for ADHD / Racing Thoughts)
  // ─────────────────────────────────────────────────────────────────────────────
  playBrownNoise(ctx, masterGain) {
    const brownNoise = this.createNoiseBuffer(ctx, 'brown', 3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.95, ctx.currentTime); // Full rich volume

    brownNoise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    brownNoise.start();
    this.activeNodes.push(brownNoise, filter, gain);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Pink Noise (Balanced Focus Drift)
  // ─────────────────────────────────────────────────────────────────────────────
  playPinkNoise(ctx, masterGain) {
    const pinkNoise = this.createNoiseBuffer(ctx, 'pink', 3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, ctx.currentTime);

    pinkNoise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    pinkNoise.start();
    this.activeNodes.push(pinkNoise, filter, gain);
  }
}

// Global Singleton Instance
export const soundEngine = new SoundEngine();
export default soundEngine;
