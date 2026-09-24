import { useEffect, useRef, useState } from 'react';
import { playSynthesizedHum } from './audioHelper';

// Plays a cloud's recorded voice; sample clouds (or blocked playback) fall back to the soft chime.
export default function useVoicePlayback(audioUrl, durationSec) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const stopHumRef = useRef(null);
  const tickRef = useRef(null);

  const stop = () => {
    clearInterval(tickRef.current);
    try {
      audioRef.current?.pause();
    } catch {}
    stopHumRef.current?.();
    stopHumRef.current = null;
    setPlaying(false);
    setProgress(0);
  };

  useEffect(() => stop, []);

  const playHum = async () => {
    const d = Math.max(2, Math.min(durationSec || 5, 10));
    const startedAt = Date.now();
    tickRef.current = setInterval(() => setProgress(Math.min(1, (Date.now() - startedAt) / (d * 1000))), 100);
    stopHumRef.current = await playSynthesizedHum(d, stop);
  };

  const toggle = async () => {
    if (playing) return stop();
    setPlaying(true);
    if (!audioUrl) return playHum();
    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.ontimeupdate = () => audio.duration && isFinite(audio.duration) && setProgress(audio.currentTime / audio.duration);
      audio.onended = stop;
      await audio.play();
    } catch (err) {
      console.warn('Voice playback failed, playing chime instead:', err);
      playHum();
    }
  };

  return { playing, progress, toggle, stop };
}
