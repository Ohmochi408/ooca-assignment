// Shared Web Audio context, the soft chime played when a thought has no voice, and blob → data URL for storage

let audioCtx = null;

export async function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a crystal-clear, gentle, soothing meditation singing-bowl / chime sound.
 * Frequencies tuned to C-major / E-minor pentatonic (330Hz - 660Hz) which are
 * warmly audible on all laptop speakers and mobile devices.
 */
export async function playSynthesizedHum(durationSec = 5, onEnd = null) {
  try {
    const ctx = await getAudioContext();
    if (!ctx) {
      if (onEnd) setTimeout(onEnd, durationSec * 1000);
      return () => {};
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    
    // Master volume envelope: smooth fade in, gentle fade out
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    masterGain.gain.setValueAtTime(0.35, now + Math.max(0.2, durationSec - 0.8));
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    masterGain.connect(ctx.destination);

    // Warm, soothing chord notes: E4 (329.6Hz), G4 (392Hz), C5 (523.2Hz), E5 (659.2Hz)
    // Clear and soothing on laptop speakers
    const notes = [329.63, 392.0, 523.25, 659.25];
    const oscs = notes.map((freq, idx) => {
      const osc = ctx.createOscillator();
      // Triangle waves have pleasant, soft harmonic overtones that laptop speakers can produce
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle warm vibrato LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2.0 + idx * 0.5, now);
      lfoGain.gain.setValueAtTime(2.0, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + durationSec);

      // Individual note gain
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.25, now);
      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + idx * 0.08); // slight arpeggiated entrance
      osc.stop(now + durationSec);
      return osc;
    });

    const timer = setTimeout(() => {
      if (onEnd) onEnd();
    }, durationSec * 1000);

    return () => {
      clearTimeout(timer);
      try {
        const stopTime = ctx.currentTime;
        masterGain.gain.linearRampToValueAtTime(0.0001, stopTime + 0.1);
        setTimeout(() => {
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch {
              // already stopped
            }
          });
        }, 120);
      } catch {
        // context closed — nothing left to fade
      }
    };
  } catch (err) {
    console.warn('Audio playback error:', err);
    if (onEnd) setTimeout(onEnd, durationSec * 1000);
    return () => {};
  }
}

/**
 * Convert an audio Blob to Base64 Data URL so it can be saved in localStorage
 * and reliably played back across page refreshes.
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
