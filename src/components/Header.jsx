import React from 'react';
import { Sun, Moon, Sunset, CloudSun, HelpCircle, Plus } from 'lucide-react';

export default function Header({ 
  currentMode, 
  setCurrentMode, 
  timeOfDay, 
  setTimeOfDay, 
  onOpenAbout,
  onOpenRecorder,
  cloudCount 
}) {
  const times = [
    { id: 'morning', label: 'Morning', icon: CloudSun },
    { id: 'day', label: 'Day', icon: Sun },
    { id: 'sunset', label: 'Sunset', icon: Sunset },
    { id: 'night', label: 'Night', icon: Moon },
  ];

  return (
    <header className="sticky top-0 z-30 px-4 py-3 border-b border-white/10 backdrop-blur-md bg-black/20 flex flex-col gap-2.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-white/10 border border-white/20">
            <img 
              src="./assets/ooca-icon.png" 
              alt="OOCA" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.parentElement.innerHTML = '<span class="text-white text-xs font-bold">OOCA</span>';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold tracking-tight text-sm">OOCA</span>
              <span className="text-white/40 text-xs">/</span>
              <span className="text-teal-300 font-medium text-xs tracking-wide">Thought Cloud</span>
            </div>
            <p className="text-[11px] text-white/60 leading-none mt-0.5">
              2-Minute Mental Wellness Experience
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Ambient Time of Day selector */}
          <div className="flex items-center bg-black/30 rounded-full p-0.5 border border-white/10">
            {times.map((t) => {
              const Icon = t.icon;
              const isActive = timeOfDay === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeOfDay(t.id)}
                  title={`Switch to ${t.label} ambient sky`}
                  className={`p-1.5 rounded-full transition-all ${
                    isActive 
                      ? 'bg-teal-400/20 text-teal-300 shadow-sm' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {/* About / Brief Modal Button */}
          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors border border-white/10"
            title="UX Concept & Product Brief"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs (Time Sky vs My Skies) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 w-full max-w-[280px]">
          <button
            onClick={() => setCurrentMode('time')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all text-center ${
              currentMode === 'time'
                ? 'bg-teal-500 text-white shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🕒 Time Sky
          </button>
          <button
            onClick={() => setCurrentMode('skies')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all text-center ${
              currentMode === 'skies'
                ? 'bg-teal-500 text-white shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            ☁️ My Skies
          </button>
        </div>

        {/* Quick Add Thought Pill */}
        <button
          onClick={onOpenRecorder}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-900 text-xs font-bold shadow-lg shadow-teal-500/20 transition-transform active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Thought</span>
        </button>
      </div>
    </header>
  );
}
