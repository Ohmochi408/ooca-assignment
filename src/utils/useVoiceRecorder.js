import { useEffect, useRef, useState } from 'react';
import { blobToDataURL, getAudioContext } from './audioHelper';

export const MAX_RECORDING_SEC = 60;
const WAVE_BARS = 9;

// Records from the microphone with MediaRecorder and samples the input level for a live waveform.
// If the mic is unavailable (denied / unsupported), it still times the "recording" so the flow keeps working.
export default function useVoiceRecorder() {
  const [phase, setPhase] = useState('idle'); // idle | recording | saved
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState(() => Array(WAVE_BARS).fill(0.15));
  const [audioUrl, setAudioUrl] = useState(null);
  const [micAvailable, setMicAvailable] = useState(true);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const levelTimerRef = useRef(null);
  const samplesRef = useRef([]);
  const activeRef = useRef(false);

  const cleanup = () => {
    clearInterval(timerRef.current);
    clearInterval(levelTimerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => cleanup, []);

  const stop = () => {
    activeRef.current = false;
    clearInterval(timerRef.current);
    clearInterval(levelTimerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    else cleanup();
    setPhase('saved');
  };

  const start = async () => {
    setElapsed(0);
    setAudioUrl(null);
    chunksRef.current = [];
    samplesRef.current = [];
    setPhase('recording');
    activeRef.current = true;

    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(sec);
      if (sec >= MAX_RECORDING_SEC) stop();
    }, 250);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!activeRef.current) {
        // Stopped while the permission prompt was open — nothing was recorded
        stream.getTracks().forEach((t) => t.stop());
        setMicAvailable(false);
        return;
      }
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        // Data URL so the voice survives a page refresh (localStorage)
        setAudioUrl(await blobToDataURL(blob).catch(() => URL.createObjectURL(blob)));
        cleanup();
      };
      recorder.start();

      const ctx = await getAudioContext();
      if (ctx) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        levelTimerRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (const v of buf) sum += ((v - 128) / 128) ** 2;
          const level = Math.min(1, Math.sqrt(sum / buf.length) * 4);
          samplesRef.current.push(level);
          setLevels((prev) => [...prev.slice(1), Math.max(0.12, level)]);
        }, 100);
      }
    } catch (err) {
      console.warn('Microphone unavailable — continuing without audio:', err);
      setMicAvailable(false);
      if (!activeRef.current) return;
      levelTimerRef.current = setInterval(() => {
        setLevels((prev) => [...prev.slice(1), 0.15 + Math.random() * 0.5]);
      }, 150);
    }
  };

  // Downsample the whole recording into a small waveform stored with the cloud
  const waveform = () => {
    const s = samplesRef.current;
    if (!s.length) return Array.from({ length: WAVE_BARS }, () => 25 + Math.round(Math.random() * 60));
    return Array.from({ length: WAVE_BARS }, (_, i) => {
      const chunk = s.slice(Math.floor((i * s.length) / WAVE_BARS), Math.floor(((i + 1) * s.length) / WAVE_BARS));
      const peak = chunk.length ? Math.max(...chunk) : 0;
      return Math.round(20 + peak * 80);
    });
  };

  return { phase, elapsed, levels, audioUrl, micAvailable, start, stop, waveform };
}
