// ============================================================================
// TIGER TALLY — Procedural Ancient Chinese WebAudio Synthesizer
// Guzheng Pentatonic Plucks, Smithy Anvil, Bronze War-Drums, & Clash SFX
// ============================================================================

window.TigerAudio = (function () {
  let ctx = null;
  let muted = false;

  // D Major Pentatonic / Guqin-Guzheng frequencies (D4, E4, F#4, A4, B4, D5, E5, F#5)
  const PENTATONIC = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99];

  function ensureCtx() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function pluckGuzheng(noteIdx = 2, vol = 0.12) {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const freq = PENTATONIC[Math.max(0, Math.min(PENTATONIC.length - 1, noteIdx))];

    const osc = c.createOscillator();
    const osc2 = c.createOscillator();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();

    osc.type = 'triangle';
    osc2.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2.0, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.65);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.72);

    const g2 = c.createGain();
    g2.gain.value = 0.25;

    osc.connect(filter);
    osc2.connect(g2);
    g2.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.75);
    osc2.stop(now + 0.75);
  }

  function anvilClang() {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    [820, 1290, 1940].forEach((f, idx) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = idx === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.09 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.34);
    });
  }

  function warDrum(heavy = false) {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(heavy ? 118 : 145, now);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 42 : 55, now + (heavy ? 0.45 : 0.26));

    gain.gain.setValueAtTime(heavy ? 0.28 : 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.48 : 0.28));

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + (heavy ? 0.5 : 0.3));
  }

  function swordClash() {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    // Metallic noise + ring
    const bufferSize = c.sampleRate * 0.14;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = c.createBufferSource();
    noise.buffer = buffer;

    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2600;
    filter.Q.value = 3.2;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    noise.start(now);
  }

  function arrowVolley() {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.12);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  function fireRoar() {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const bufferSize = c.sampleRate * 0.42;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(320, now + 0.42);
    const gain = c.createGain();
    gain.gain.value = 0.18;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    noise.start(now);
  }

  function fanfare(win = true) {
    const c = ensureCtx();
    if (!c) return;
    const notes = win ? [0, 2, 3, 5, 7] : [4, 2, 1, 0];
    notes.forEach((n, idx) => {
      setTimeout(() => pluckGuzheng(n, 0.15), idx * 110);
    });
    if (win) setTimeout(() => warDrum(true), 40);
  }

  return {
    pluck: pluckGuzheng,
    anvil: anvilClang,
    drum: warDrum,
    clash: swordClash,
    arrow: arrowVolley,
    fire: fireRoar,
    fanfare,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    }
  };
})();
