import React, { useRef, useState } from 'react';
import { formatDuration } from '../utils/format';

// Voice timeline: tap or drag anywhere on the bar to jump there (←/→ = 1 s, Home/End), elapsed left, remaining right.
// While dragging only the bar moves; the voice jumps when the finger / mouse lets go.
export default function VoiceProgress({ progress, duration, onSeek, thick = false, onSky = false, label = 'Voice position' }) {
  const [drag, setDrag] = useState(null);
  const bar = useRef(null);
  const shown = drag ?? progress;
  const elapsed = Math.round(shown * duration);

  const at = (e) => {
    const r = bar.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const down = (e) => {
    e.stopPropagation(); // don't start a sky swipe
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(at(e));
  };
  const move = (e) => drag !== null && setDrag(at(e));
  const up = (e) => {
    if (drag === null) return;
    onSeek(at(e));
    setDrag(null);
  };
  const key = (e) => {
    const step = 1 / duration;
    const to = { ArrowRight: progress + step, ArrowUp: progress + step, ArrowLeft: progress - step, ArrowDown: progress - step, Home: 0, End: 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    onSeek(Math.min(1, Math.max(0, to)));
  };

  const track = thick ? 'h-4' : 'h-2';
  const thumb = thick ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="w-full">
      <div
        ref={bar}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={elapsed}
        aria-valuetext={`${formatDuration(elapsed)} of ${formatDuration(duration)}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={key}
        onClick={(e) => e.stopPropagation()}
        className="group/bar relative w-full h-6 flex items-center cursor-pointer touch-none rounded-ooca-pill"
      >
        <div className={`w-full rounded-ooca-pill overflow-hidden ${track} ${onSky ? 'bg-white' : 'bg-gray-400'}`}>
          <div className={`h-full rounded-ooca-pill bg-turquoise-500 ${drag === null ? 'transition-[width] duration-100' : ''}`} style={{ width: `${shown * 100}%` }} />
        </div>
        {/* Handle: shows on hover / focus / drag so the bar reads as something you can grab */}
        <span
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-turquoise-500 shadow-elevation-2 transition-[opacity,transform] ${thumb} ${drag !== null ? 'opacity-100 scale-110' : 'opacity-0 group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100'}`}
          style={{ left: `${shown * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <div className={`flex justify-between tabular-nums ${onSky ? 'text-title3 text-white' : 'text-body3 text-black'}`}>
        <span>{formatDuration(elapsed)}</span>
        <span>-{formatDuration(Math.max(0, duration - elapsed))}</span>
      </div>
    </div>
  );
}
