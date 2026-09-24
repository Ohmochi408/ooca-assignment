import { useEffect, useRef, useState } from 'react';
import { blobToDataURL, getAudioContext } from './audioHelper';

export const MAX_RECORDING_SEC = 60;

// Records from the microphone with MediaRecorder and samples the input level (10× a second) for live feedback.
// If the mic is unavailable (denied / unsupported), it still times the "recording" so the flow keeps working.
export default function useVoiceRecorder() {
  const [phase, setPhase] = useState('idle'); // idle | recording | saved
  const [elapsed, setElapsed] = useState(0);
  // A new object per sample, so the screen hears every sample — even a run of identical silent ones
  const [sample, setSample] = useState({ level: 0, at: 0 });
  const [audioUrl, setAudioUrl] = useState(null);
  // asking (permission prompt open) | on | off — known as soon as recording starts, not after
  const [mic, setMic] = useState('asking');

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const levelTimerRef = useRef(null);
  const activeRef = useRef(false);
  const takeRef = useRef(0); // bumps on every start/reset, so a late mic answer from an older take is ignored

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
    else {
      cleanup();
      setMic((m) => (m === 'asking' ? 'off' : m)); // stopped before the mic ever opened
    }
    setPhase('saved');
  };

  const start = async () => {
    setElapsed(0);
    setAudioUrl(null);
    setMic('asking');
    setSample({ level: 0, at: 0 });
    chunksRef.current = [];
    recorderRef.current = null;
    setPhase('recording');
    activeRef.current = true;
    const take = ++takeRef.current;

    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(sec);
      if (sec >= MAX_RECORDING_SEC) stop();
    }, 250);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (take !== takeRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      if (!activeRef.current) {
        // Stopped while the permission prompt was open — nothing was recorded
        stream.getTracks().forEach((t) => t.stop());
        setMic('off');
        return;
      }
      streamRef.current = stream;
      setMic('on');

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
      // Browsers keep audio locked until a tap; if the unlock from the mic button has expired, finish it on the next tap
      if (ctx && ctx.state !== 'running') {
        const unlock = () => ctx.resume();
        window.addEventListener('pointerdown', unlock, { once: true });
      }
      if (ctx) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        levelTimerRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (const v of buf) sum += ((v - 128) / 128) ** 2;
          // RMS of normal speech is ~0.02–0.15, so scale it up to a 0…1 level that reacts to a quiet voice too
          const level = Math.min(1, Math.sqrt(sum / buf.length) * 7);
          setSample({ level, at: Date.now() });
        }, 100);
      }
    } catch (err) {
      if (take !== takeRef.current) return;
      console.warn('Microphone unavailable — continuing without audio:', err);
      setMic('off'); // no fake level: the screen says plainly that nothing is being heard
    }
  };

  // Throw the take away and go back to idle
  const reset = () => {
    takeRef.current++;
    activeRef.current = false;
    cleanup();
    setPhase('idle');
    setElapsed(0);
    setAudioUrl(null);
  };

  return { phase, elapsed, sample, audioUrl, mic, start, stop, reset };
}
