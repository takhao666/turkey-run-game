// audio.js — all sound is synthesized with WebAudio. No audio files, no
// network: every gobble, thud and jingle is an oscillator shaped in code.

export function createAudio() {
  return {
    ctx: null,
    muted: false,
    musicTimer: 0,
    musicStep: 0,
    musicOn: false,
  };
}

function ensureContext(audio) {
  if (!audio.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audio.ctx = new AC();
  }
  if (audio.ctx.state === 'suspended') audio.ctx.resume();
  return audio.ctx;
}

export function audioUnlock(audio) {
  ensureContext(audio);
}

function tone(audio, freq, dur, type, vol, when, slideTo) {
  if (audio.muted) return;
  const ctx = ensureContext(audio);
  if (!ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(audio, dur, vol, when, lowpass) {
  if (audio.muted) return;
  const ctx = ensureContext(audio);
  if (!ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass || 900;
  const gain = ctx.createGain();
  gain.gain.value = vol || 0.2;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t0);
}

export function playGobble(audio) {
  // Gobble-gobble: three quick descending clucks.
  tone(audio, 420, 0.09, 'square', 0.1, 0, 260);
  tone(audio, 380, 0.09, 'square', 0.1, 0.11, 230);
  tone(audio, 340, 0.14, 'square', 0.11, 0.22, 190);
}

export function playJump(audio) {
  tone(audio, 300, 0.18, 'sine', 0.14, 0, 620);
}

export function playPickup(audio) {
  tone(audio, 880, 0.09, 'triangle', 0.16);
  tone(audio, 1318, 0.14, 'triangle', 0.16, 0.07);
}

export function playHit(audio) {
  noiseBurst(audio, 0.22, 0.3, 0, 500);
  tone(audio, 140, 0.25, 'sawtooth', 0.16, 0, 60);
}

export function playAlarm(audio) {
  tone(audio, 660, 0.12, 'square', 0.08);
  tone(audio, 660, 0.12, 'square', 0.08, 0.16);
}

export function playCaught(audio) {
  tone(audio, 392, 0.3, 'sawtooth', 0.16, 0, 370);
  tone(audio, 311, 0.3, 'sawtooth', 0.16, 0.28, 294);
  tone(audio, 233, 0.6, 'sawtooth', 0.18, 0.56, 110);
  noiseBurst(audio, 0.3, 0.2, 0.5, 400);
}

export function playEscaped(audio) {
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((n, i) => tone(audio, n, 0.22, 'triangle', 0.16, i * 0.13));
  tone(audio, 1319, 0.5, 'triangle', 0.14, 0.8);
}

export function playClick(audio) {
  tone(audio, 700, 0.06, 'triangle', 0.12);
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  return audio.muted;
}

// A light banjo-ish pluck loop: a cheerful autumn walk in C major pentatonic.
const MUSIC_NOTES = [523, 587, 659, 784, 880, 784, 659, 587];
export function updateMusic(audio, dt, playing) {
  if (audio.muted || !playing) return;
  audio.musicTimer -= dt;
  if (audio.musicTimer <= 0) {
    audio.musicTimer = 0.24;
    const note = MUSIC_NOTES[audio.musicStep % MUSIC_NOTES.length];
    tone(audio, note, 0.2, 'triangle', 0.045);
    if (audio.musicStep % 4 === 2) tone(audio, note / 2, 0.3, 'sine', 0.03);
    audio.musicStep += 1;
  }
}
