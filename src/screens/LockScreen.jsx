import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import SkyBackground from '../components/SkyBackground';
import lockShortcut from '../assets/lock-shortcut.png';

// iPhone lock screen — the entry point of the 2-minute flow. Like a real lock-screen shortcut (e.g. Duolingo's
// "Ready to practice?"), ooca adds just one thing: "Leave a thought here?", bottom centre.
//   tap the shortcut      → recording starts straight away, over the sky of right now
//   swipe up / Home bar   → opens ooca on Time Sky, to look back
export default function LockScreen({ period, onOpenSky, onAddThought, onOpenAbout }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  // Swipe up from the bottom to "unlock" (a tap on the Home bar does the same)
  const swipe = useRef(null);
  const onDown = (e) => (swipe.current = e.clientY);
  const onUp = (e) => {
    if (swipe.current !== null && swipe.current - e.clientY > 60) onOpenSky();
    swipe.current = null;
  };

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  // iOS style: "Fri 25 Sep"
  const date = `${now.toLocaleDateString('en-US', { weekday: 'short' })} ${now.getDate()} ${now.toLocaleDateString('en-US', { month: 'short' })}`;

  return (
    <div className="relative h-full flex flex-col items-center select-none overflow-hidden touch-none" onPointerDown={onDown} onPointerUp={onUp}>
      <SkyBackground period={period} />
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />

      {/* Status bar (device chrome) */}
      <div className="relative w-full flex items-center justify-between px-8 pt-4 text-body4 text-white/85">
        <span>ooca</span>
        <button onClick={onOpenAbout} className="min-h-11 px-3 -my-3 text-small uppercase text-white/60 hover:text-white cursor-pointer">
          prototype · about
        </button>
        <Icon name="wifi" size={16} />
      </div>

      {/* Lock-screen clock (device chrome, not ooca UI) */}
      <div className="relative mt-6 flex flex-col items-center text-white/90">
        <Icon name="lock-bold" size={18} className="mb-3 text-white/70" />
        <p className="text-title2">{date}</p>
        {/* ds-allow: iOS-style lock-screen clock mock */}
        <p className="text-[96px] leading-none font-bold tracking-tight tabular-nums mt-1">{time}</p>
      </div>

      {/* ooca's lock-screen shortcut */}
      <div className="relative mt-auto mb-6 flex flex-col items-center gap-10">
        <button
          onClick={onAddThought}
          onPointerDown={(e) => e.stopPropagation()} // a tap here is not the start of an unlock swipe
          aria-label="Leave a thought here? Start recording"
          className="rounded-ooca-24 px-3 py-2 transition-transform active:scale-95 hover:bg-white/10 cursor-pointer"
        >
          <img src={lockShortcut} alt="" width={180} height={45} draggable="false" />
        </button>

        {/* Home bar: tap or swipe up to open ooca */}
        <button onClick={onOpenSky} aria-label="Open ooca" className="flex flex-col items-center gap-2 px-10 pt-2 pb-1 cursor-pointer group">
          <span className="text-body5 text-white/70 group-hover:text-white">Swipe up to open</span>
          <span className="w-[134px] h-[5px] rounded-ooca-pill bg-white/85" />
        </button>
      </div>
    </div>
  );
}
