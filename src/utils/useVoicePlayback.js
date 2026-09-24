import { useEffect, useRef, useState } from 'react';
import { playSynthesizedHum } from './audioHelper';

// Plays a cloud's recorded voice; sample clouds (or blocked playback) fall back to the soft chime.
// Position is a 0…1 fraction of the cloud's duration. Pause keeps the place; seek() jumps anywhere.
// The recorded duration is used for timing (MediaRecorder webm often reports Infinity as its duration).
export default function useVoicePlayback(audioUrl, durationSec) {
  const total = Math.max(1, durationSec || 5);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const pos = useRef(0);
  const playingRef = useRef(false);
  const audioRef = useRef(null);
  const humRef = useRef(null); // { stop } of the chime currently sounding
  const tickRef = useRef(null);
  const runRef = useRef(0); // bumps on every play/pause, so a chime that starts late after a pause is silenced

  const setPos = (f) => {
    pos.current = Math.min(1, Math.max(0, f));
    setProgress(pos.current);
  };

  const halt = () => {
    runRef.current++;
    clearInterval(tickRef.current);
    try {
      audioRef.current?.pause();
    } catch {
      // not playing yet
    }
    humRef.current?.();
    humRef.current = null;
    playingRef.current = false;
    setPlaying(false);
  };

  const finish = () => {
    halt();
    setPos(0);
  };

  useEffect(
    () => () => {
      halt();
      audioRef.current = null;
    },
    [],
  );

  const playChimeFrom = async (f, run) => {
    const startedAt = Date.now();
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => setPos(f + (Date.now() - startedAt) / (total * 1000)), 100);
    const stopHum = await playSynthesizedHum(Math.max(0.4, (1 - f) * total), finish);
    if (run !== runRef.current) return stopHum(); // paused / sought while the chime was starting
    humRef.current = stopHum;
  };

  const playFrom = async (f) => {
    const run = ++runRef.current;
    playingRef.current = true;
    setPlaying(true);
    setPos(f);
    if (audioUrl) {
      try {
        let a = audioRef.current;
        if (!a) {
          a = new Audio(audioUrl);
          audioRef.current = a;
          a.ontimeupdate = () => playingRef.current && setPos(a.currentTime / total);
          a.onended = finish;
        }
        a.currentTime = f * total;
        await a.play();
        return;
      } catch (err) {
        console.warn('Voice playback failed, playing chime instead:', err);
        audioRef.current = null;
        if (run !== runRef.current) return;
      }
    }
    playChimeFrom(f, run);
  };

  const toggle = () => (playingRef.current ? halt() : playFrom(pos.current >= 0.999 ? 0 : pos.current));

  const seek = (f) => {
    const to = Math.min(1, Math.max(0, f));
    if (!playingRef.current) return setPos(to);
    if (audioRef.current && !humRef.current) {
      audioRef.current.currentTime = to * total;
      setPos(to);
    } else {
      halt();
      playFrom(to);
    }
  };

  return { playing, progress, toggle, seek, stop: finish, pause: halt };
}
