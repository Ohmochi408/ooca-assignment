import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import SkyBackground from '../components/SkyBackground';
import condensingCloud from '../assets/condensing-cloud.svg';
import useVoiceRecorder, { MAX_RECORDING_SEC } from '../utils/useVoiceRecorder';
import { riseDelay } from '../utils/motion';

const pad = (n) => String(n).padStart(2, '0');
// Figma "00.00.00" — minutes.seconds.hundredths
const stopwatch = (ms) => `${pad(Math.floor(ms / 60000))}.${pad(Math.floor(ms / 1000) % 60)}.${pad(Math.floor(ms / 10) % 100)}`;

// Ideate2 → "Add cloud" (recording): recording starts as soon as the screen opens, over the sky the user came from.
// While they speak, the thought is "condensing" into a cloud; stopping hands it to "Cloud ready".
export default function RecordScreen({ sky, onDone }) {
  const rec = useVoiceRecorder();
  const { phase, elapsed, sample, mic } = rec;
  const [ms, setMs] = useState(0);
  const [dots, setDots] = useState(0);
  const startedAt = useRef(0);
  const quietSince = useRef(0); // last time the mic heard something
  const finished = useRef(false);

  // Start on open; leaving throws the take away (also keeps StrictMode's double mount clean)
  useEffect(() => {
    rec.start();
    return () => rec.reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Stopwatch + "Condensing.•." dots
  useEffect(() => {
    if (phase !== 'recording') return;
    startedAt.current = quietSince.current = Date.now();
    let raf;
    const tick = () => {
      setMs(Date.now() - startedAt.current);
      raf = requestAnimationFrame(tick);
    };
    tick();
    const d = setInterval(() => setDots((n) => (n + 1) % 4), 400);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(d);
    };
  }, [phase]);

  // Once the take is saved (and the voice is encoded), go straight to the ready cloud
  useEffect(() => {
    if (phase !== 'saved' || finished.current) return;
    if (mic !== 'off' && !rec.audioUrl) return;
    finished.current = true;
    onDone({ duration: Math.max(1, elapsed), audioUrl: rec.audioUrl });
  }, [phase, rec.audioUrl, mic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Voice feedback: rings pulse out of the cloud when the mic hears something; the glow follows the level
  const { level } = sample;
  const [rings, setRings] = useState([]);
  const lastRing = useRef(0);
  const [quiet, setQuiet] = useState(false);
  useEffect(() => {
    if (phase !== 'recording' || mic !== 'on') return;
    const now = Date.now();
    const heard = level > 0.12;
    if (heard) quietSince.current = now;
    setQuiet(!heard && now - quietSince.current > 4000);
    if (heard && now - lastRing.current > 240) {
      lastRing.current = now;
      const ring = { id: now, strength: Math.min(1, (level - 0.12) / 0.5) };
      setRings((r) => [...r.slice(-5), ring]);
      setTimeout(() => setRings((r) => r.filter((x) => x.id !== ring.id)), 1500);
    }
  }, [sample]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = phase === 'recording' && mic === 'on';

  return (
    <div className="relative h-full overflow-hidden">
      <SkyBackground period={sky} />
      <div className="fade-in absolute inset-x-0 bottom-0 h-[132px] bg-gradient-to-b from-transparent via-white/30 to-white/60" aria-hidden="true" />

      <div className="relative h-full flex flex-col items-center px-6 pt-8 pb-[108px] short:pt-4 short:pb-20">
        <div style={riseDelay(0)} className="rise-in text-center">
          <h1 className="text-h4 text-white">What’s on your mind?</h1>
          <p className="text-body1 text-turquoise-50 mt-2 max-w-[260px]">Say it. Hum it. Sigh it. It doesn't have to make sense</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-10 short:gap-2 w-full" aria-live="polite">
          <div style={riseDelay(90)} className="rise-in relative -mb-14 lg:scale-125 lg:my-6 short:scale-75 short:-my-10">
            {/* Rings sit behind the cloud body (176×112 at 40,15 inside the 256×192 image) */}
            <div className="absolute left-[40px] top-[15px] w-[176px] h-[112px] pointer-events-none" aria-hidden="true">
              <div className="absolute -inset-3 bg-white/40 blur-xl transition-opacity duration-150" style={{ borderRadius: '50%', opacity: live ? Math.min(1, level * 1.6) : 0 }} />
              {/* Steady ring that follows the level — also the feedback when motion is reduced */}
              <span className="absolute inset-0 border-white/80 transition-[transform,opacity] duration-150" style={{ borderWidth: 2, borderStyle: 'solid', borderRadius: '50%', opacity: live ? Math.min(0.9, level * 1.5) : 0, transform: `scale(${1.08 + (live ? Math.min(level, 1) : 0) * 0.35})` }} />
              {rings.map((r) => (
                <span key={r.id} className="voice-ring absolute inset-0 border-white/90" style={{ '--ring-strength': r.strength, borderWidth: 1.5 + r.strength * 2.5, borderStyle: 'solid', borderRadius: '50%' /* ellipse around the cloud */ }} />
              ))}
            </div>
            {/* Figma "Condensing" cloud (with its turquoise glow) swells a little with the voice; the label is live text so the dots can move */}
            <div className="relative transition-transform duration-150" style={{ transform: `scale(${1 + (live ? Math.min(level, 1) : 0) * 0.08})` }}>
              <img src={condensingCloud} alt="" width={256} height={192} draggable="false" className="select-none" />
            </div>
            {/* Same spot as the Figma frame: left-aligned at x 57, centred on y 80 of the 256×192 cloud, so the word never shifts as the dots change */}
            <p className="absolute left-[57px] top-[80px] -translate-y-1/2 whitespace-nowrap text-h4 text-turquoise-500">
              Condensing<span aria-hidden="true">{'.•.'.slice(0, dots)}</span>
            </p>
          </div>
          <p style={riseDelay(180)} className="rise-in text-h4 text-white tabular-nums" aria-label={`Recording, ${elapsed} seconds of ${MAX_RECORDING_SEC}`}>
            {stopwatch(ms)}
          </p>
          {mic === 'off' && (
            <p role="alert" className="flex items-start gap-2 text-body4 text-white bg-black/30 rounded-ooca-8 px-3 py-2 max-w-[300px]">
              <Icon name="info" size={16} className="shrink-0 mt-px" />
              Your microphone isn't available, so your voice won't be kept. You can still finish — the thought will play a soft chime instead.
            </p>
          )}
          {mic === 'asking' && phase === 'recording' && <p className="text-body4 text-white bg-black/30 rounded-ooca-8 px-3 py-2">Allow the microphone to record your voice</p>}
          {live && quiet && <p className="text-body4 text-white bg-black/30 rounded-ooca-8 px-3 py-2 fade-in">It's quiet — try speaking a little closer</p>}
        </div>
      </div>

      <div style={riseDelay(240)} className="rise-in absolute bottom-[108px] short:bottom-4 inset-x-0 flex justify-center">
        <button
          onClick={rec.stop}
          disabled={phase !== 'recording'}
          aria-label="Stop recording"
          className="w-14 h-14 rounded-full bg-white shadow-elevation-3 flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:cursor-default"
        >
          {/* ds-allow: 4px corner on the stop square, as in Figma */}
          <span className="w-6 h-6 rounded-[4px] bg-turquoise-500" />
        </button>
      </div>
    </div>
  );
}
