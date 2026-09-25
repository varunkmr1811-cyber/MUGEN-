// Premium Web Audio API Sound Synthesizer for MUGEN (無限)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Satisfying mechanical check tick (ASMR crisp wood / haptic switch click)
 */
export function playCheckSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Transient click layer (mechanical snap)
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(3.0, now);

  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(1200, now);
  snapOsc.frequency.exponentialRampToValueAtTime(350, now + 0.035);

  snapGain.gain.setValueAtTime(0.22, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  snapOsc.connect(filter);
  filter.connect(snapGain);
  snapGain.connect(ctx.destination);

  snapOsc.start(now);
  snapOsc.stop(now + 0.045);

  // Sweet melodic ping layer (harmonic satisfaction)
  const pingOsc = ctx.createOscillator();
  const pingGain = ctx.createGain();

  pingOsc.type = 'sine';
  pingOsc.frequency.setValueAtTime(587.33, now + 0.01); // D5
  pingOsc.frequency.exponentialRampToValueAtTime(880, now + 0.07); // A5

  pingGain.gain.setValueAtTime(0.12, now + 0.01);
  pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  pingOsc.connect(pingGain);
  pingGain.connect(ctx.destination);

  pingOsc.start(now + 0.01);
  pingOsc.stop(now + 0.13);
}

/**
 * Cancel tick sound (satisfying tactile wooden thud / strike)
 */
export function playCancelSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(850, now);

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.065);
}

/**
 * Clear/reset cell sound (soft subtle release)
 */
export function playClearSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * 100% Day Celebration (Harmonic arpeggio chord)
 */
export function playCelebrationSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Major triad shimmer: C5, E5, G5, B5, C6
  const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
  notes.forEach((freq, idx) => {
    const startTime = ctx.currentTime + idx * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.16, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.33);
  });
}

/**
 * Level Up & Trophy Fanfare
 */
export function playLevelUpSound(enabled: boolean = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
  notes.forEach((freq, idx) => {
    const startTime = ctx.currentTime + idx * 0.07;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.46);
  });
}
