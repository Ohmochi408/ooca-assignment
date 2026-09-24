import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import SkyBackground from '../components/SkyBackground';
import { CloudShape } from '../components/Cloud';
import { SKY_PERIODS, getSkyPeriod } from '../utils/skyPeriods';
import { dateKey } from '../utils/dates';

// Phone home screen with the ooca widget — the entry point of the 2-minute flow.
export default function WidgetScreen({ period, clouds, onOpenSky, onAddThought }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Two clouds fit with their names readable; the count covers the rest
  const latest = [...clouds].sort((a, b) => b.timestamp - a.timestamp).slice(0, 2);
  const today = dateKey(now);
  const todayCount = (pid) => clouds.filter((c) => dateKey(c.timestamp) === today && getSkyPeriod(new Date(c.timestamp)) === pid).length;
  const dock = [
    { bg: 'bg-blue-500', icon: 'home' },
    { bg: 'bg-flamingo-500', icon: 'chat' },
    { bg: 'bg-guava-500', icon: 'calendar' },
    { bg: 'bg-marigo-500', icon: 'music' },
  ];

  return (
    <div className="relative h-full flex flex-col items-center select-none overflow-hidden">
      <SkyBackground period={period} />
      <div className="absolute inset-0 bg-black/30" />

      {/* Status bar */}
      <div className="relative w-full flex items-center justify-between px-7 pt-4 text-body4 text-white/80">
        <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="text-small text-white/40 uppercase">prototype</span>
        <Icon name="volume" size={16} />
      </div>

      {/* Lock-screen clock (device chrome, not ooca UI) */}
      <div className="relative mt-10 flex flex-col items-center">
        {/* ds-allow: iOS-style lock screen clock mock */}
        <p className="text-white text-[64px] leading-none font-light">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-body1 text-white/70 mt-2">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* ooca widget */}
      <div className="relative mt-10 w-full px-5 flex flex-col gap-3">
        <div className="w-full rounded-ooca-24 bg-white/90 backdrop-blur-md shadow-elevation-8 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CloudShape width={26} fill="var(--color-turquoise-500)" />
              <span className="text-title3 text-turquoise-500">ooca</span>
            </div>
            <span className="text-body4 text-bluegray-500">{clouds.length} thoughts</span>
          </div>

          <button onClick={() => onOpenSky()} className="relative block w-full h-28 rounded-ooca-16 overflow-hidden mb-3 cursor-pointer" aria-label="Open your sky">
            <SkyBackground period={period} />
            {latest.map((c, i) => (
              <div key={c.id} className="absolute top-3 -translate-x-1/2" style={{ left: `${28 + i * 44}%` }}>
                <CloudShape width={124} />
                <p className="absolute inset-x-5 top-6 bottom-2 flex items-center justify-center text-center text-body5 text-bluegray-800">
                  <span className="line-clamp-2">{c.label}</span>
                </p>
              </div>
            ))}
          </button>

          <div className="flex items-center justify-between">
            <p className="text-body4 text-bluegray-700">What's on your mind?</p>
            <button onClick={onAddThought} className="ooca-btn ooca-btn-primary ooca-btn-turquoise px-4 gap-1">
              <Icon name="mic" size={18} />
              Add
            </button>
          </div>
        </div>
        {/* Today's six skies at a glance — tap one to open it */}
        <div className="w-full rounded-ooca-24 bg-white/90 backdrop-blur-md shadow-elevation-8 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-subheader1 text-bluegray-800">Today's skies</p>
            <span className="text-body5 text-bluegray-600">{SKY_PERIODS.reduce((n, p) => n + todayCount(p.id), 0)} today</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {SKY_PERIODS.map((p) => {
              const n = todayCount(p.id);
              const isNow = p.id === period;
              return (
                <button
                  key={p.id}
                  onClick={() => onOpenSky(p.id)}
                  aria-current={isNow ? 'time' : undefined}
                  aria-label={`${p.label}, ${p.range}, ${n} thought${n === 1 ? '' : 's'}${isNow ? ', now' : ''}`}
                  className="flex flex-col items-center gap-1 cursor-pointer group"
                >
                  <span className={`sky-${p.id} relative w-full h-11 rounded-ooca-8 flex items-center justify-center transition-transform group-hover:-translate-y-0.5 ${isNow ? 'ring-2 ring-turquoise-500 ring-offset-2' : ''}`}>
                    {n > 0 && <span className="min-w-5 h-5 px-1 rounded-ooca-pill bg-white text-body4 text-bluegray-800 flex items-center justify-center">{n}</span>}
                  </span>
                  <span className={`text-body5 ${isNow ? 'text-turquoise-900' : 'text-bluegray-600'}`}>{isNow ? 'Now' : p.range.slice(0, 2)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-body5 text-white/85 text-center mt-1">Tap a sky to look back, or Add to say something</p>
      </div>

      {/* Dock */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center">
        <div className="flex gap-4 px-5 py-3 rounded-ooca-24 bg-white/15 backdrop-blur-md">
          {dock.map((d) => (
            <div key={d.icon} className={`w-12 h-12 rounded-ooca-16 flex items-center justify-center text-white opacity-80 ${d.bg}`}>
              <Icon name={d.icon} size={26} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
