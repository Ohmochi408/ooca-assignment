// Audio utility for real MediaRecorder and relaxing ambient synthesizer

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
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
 * Play a relaxing, gentle ambient hum / chord to represent a voice/thought
 * when real recorded audio isn't available or in simulated mode.
 */
export function playSynthesizedHum(durationSec = 5, onEnd = null) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return () => {};

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.2, now + 0.8);
    masterGain.gain.setValueAtTime(0.2, now + durationSec - 1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
    masterGain.connect(ctx.destination);

    // Warm chords: Root (174Hz - soothing tone), Minor third (207Hz), Fifth (261Hz)
    const freqs = [174.61, 220.0, 261.63];
    const oscs = freqs.map((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // subtle vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2.5, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + durationSec);

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + durationSec);
      return osc;
    });

    const timer = setTimeout(() => {
      if (onEnd) onEnd();
    }, durationSec * 1000);

    return () => {
      clearTimeout(timer);
      try {
        oscs.forEach((o) => o.stop());
      } catch (e) {}
    };
  } catch (err) {
    console.warn('Audio synthesis unavailable:', err);
    if (onEnd) setTimeout(onEnd, durationSec * 1000);
    return () => {};
  }
}
