import React from 'react';
import Icon from '../components/Icon';
import { SkyBackdrop } from '../components/SkyBackground';
import ScreenHeader from '../components/ScreenHeader';
import useVoiceRecorder, { MAX_RECORDING_SEC } from '../utils/useVoiceRecorder';
import { formatDuration } from '../utils/format';

function MicNotice({ children }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-left text-body4 text-white bg-black/40 rounded-ooca-8 px-3 py-2 max-w-[300px]">
      <Icon name="info" size={16} className="shrink-0 mt-px" />
      {children}
    </p>
  );
}

const rise = (ms) => ({ '--rise-delay': `${ms}ms` });

// Recording happens over the sky the user was looking at when they tapped "Add a thought".
export default function RecordScreen({ sky, onBack, onDone }) {
  const rec = useVoiceRecorder();
  const { phase, elapsed, levels, mic } = rec;

  const finish = () => onDone({ duration: Math.max(1, elapsed), audioUrl: rec.audioUrl, frequency: rec.waveform() });

  return (
    <div className="relative h-full overflow-hidden">
      <SkyBackdrop period={sky} fade />

      <div className="relative h-full flex flex-col items-center justify-between px-6 py-8">
        <div style={rise(0)} className="rise-in w-full">
          <ScreenHeader onBack={onBack} onSky />
        </div>

        <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full">
          <div style={rise(90)} className="rise-in text-center">
            <h1 className="text-h3 text-white mb-2">What's on your mind?</h1>
            <p className="text-body3 text-white/85">
              Say it. Hum it. Sigh it.
              <br />
              It doesn't have to make sense.
            </p>
          </div>

          {/* Mic */}
          <div style={rise(180)} className="rise-in relative flex items-center justify-center w-44 h-44">
            {phase === 'recording' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                <div className="absolute inset-4 rounded-full border-2 border-white/25 animate-ping [animation-delay:0.4s]" />
              </>
            )}
            <button
              onClick={phase === 'idle' ? rec.start : phase === 'recording' ? rec.stop : undefined}
              disabled={phase === 'saved'}
              aria-label={phase === 'idle' ? 'Start recording' : phase === 'recording' ? 'Stop recording' : 'Recording saved'}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center border-4 shadow-elevation-8 transition-all duration-300 cursor-pointer ${
                phase === 'recording'
                  ? 'bg-turquoise-500 border-white text-white scale-110'
                  : phase === 'saved'
                    ? 'bg-white border-turquoise-500 text-turquoise-500 cursor-default'
                    : 'bg-white border-white/60 text-turquoise-500 hover:scale-105'
              }`}
            >
              {phase === 'saved' ? <Icon name="check" size={44} /> : phase === 'recording' ? <span className="w-8 h-8 rounded-ooca-8 bg-white" aria-hidden="true" /> : <Icon name="mic" size={44} />}
            </button>
          </div>

          {/* Status */}
          <div style={rise(270)} className="rise-in min-h-[140px] flex flex-col items-center justify-start gap-3 text-center">
            {phase === 'idle' && <p className="text-subheader2 text-white/80">Tap to start · up to {MAX_RECORDING_SEC} seconds</p>}

            {phase === 'recording' && (
              <>
                {mic === 'asking' && <p className="text-body4 text-white/85">Allow the microphone to record your voice</p>}
                {mic === 'off' && <MicNotice>Your microphone isn't available, so your voice won't be kept. You can still finish — the cloud will play a soft chime instead.</MicNotice>}
                {mic !== 'off' && <div className="flex items-end gap-1 h-8" aria-hidden="true">
                  {levels.map((l, i) => (
                    <span key={i} className="w-1.5 rounded-full bg-white transition-[height] duration-100" style={{ height: `${Math.round(l * 100)}%` }} />
                  ))}
                </div>}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-flamingo-500 animate-pulse" />
                  <span className="text-h1 text-white tabular-nums">{formatDuration(elapsed)}</span>
                </div>
                <p className="text-body3 text-white/85">Tap to stop · {formatDuration(MAX_RECORDING_SEC - elapsed)} left</p>
              </>
            )}

            {phase === 'saved' && (
              <>
                <p className="text-subheader2 text-white/85">Saved · {formatDuration(elapsed)}</p>
                {mic === 'off' && <MicNotice>No voice was kept — this cloud will play a soft chime.</MicNotice>}
                <button onClick={finish} disabled={rec.micAvailable && !rec.audioUrl} data-loading={rec.micAvailable && !rec.audioUrl ? 'true' : undefined} className="ooca-btn ooca-btn-primary ooca-btn-turquoise">
                  See your cloud <Icon name="arrow-right" size={18} />
                </button>
                <button onClick={rec.reset} className="min-h-11 px-3 flex items-center gap-1 rounded-ooca-pill text-subheader2 text-white/85 hover:text-white cursor-pointer">
                  <Icon name="mic" size={16} /> Record again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
