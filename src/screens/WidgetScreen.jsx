import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import SkyBackground from '../components/SkyBackground';
import { CloudShape } from '../components/Cloud';

// Phone home screen with the ooca widget — the entry point of the 2-minute flow.
export default function WidgetScreen({ period, clouds, onOpenSky, onAddThought }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const latest = [...clouds].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
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
      <div className="relative mt-12 w-full px-5">
        <div className="w-full rounded-ooca-24 bg-white/90 backdrop-blur-md shadow-elevation-8 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CloudShape width={26} fill="var(--color-turquoise-500)" />
              <span className="text-title3 text-turquoise-500">ooca</span>
            </div>
            <span className="text-body4 text-bluegray-500">{clouds.length} thoughts</span>
          </div>

          <button onClick={onOpenSky} className="relative block w-full h-28 rounded-ooca-16 overflow-hidden mb-3 cursor-pointer" aria-label="Open your sky">
            <SkyBackground period={period} />
            {latest.map((c, i) => (
              <div key={c.id} className="absolute top-4 -translate-x-1/2" style={{ left: `${20 + i * 30}%` }}>
                <CloudShape width={78} />
                <p className="absolute inset-x-3 top-1/2 -translate-y-1/4 text-center text-small text-bluegray-800 truncate">{c.label}</p>
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
        <p className="text-body5 text-white/50 text-center mt-4">Tap the sky to look back, or + Add to say something</p>
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
