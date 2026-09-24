import React, { useState } from 'react';
import Icon from './Icon';
import SkyDot from './SkyDot';
import Tip from './Tip';
import { SKY_PERIODS, periodById } from '../utils/skyPeriods';

// Time Sky's vertical sky switcher under the calendar: closed shows the current sky, open lists all six
export default function SkyPicker({ current, onPick }) {
  const [open, setOpen] = useState(false);
  const now = periodById(current);
  return (
    <div className="w-10 rounded-ooca-24 bg-white/75 backdrop-blur-sm shadow-elevation-2 flex flex-col items-center gap-1 pt-3 pb-2">
      {open ? (
        SKY_PERIODS.map((p) => (
          <Tip key={p.id} side="left" touch label={`${p.label} · ${p.range}`}>
            <button
              onClick={() => {
                onPick(p.id);
                setOpen(false);
              }}
              aria-label={`${p.label} sky, ${p.range}`}
              aria-current={p.id === current}
              className="w-10 h-6 flex items-center justify-center cursor-pointer"
            >
              <SkyDot
                period={p.id}
                size={p.id === current ? 20 : 12}
                className={p.id === current ? 'ring-2 ring-white' : 'transition-transform hover:scale-150'}
              />
            </button>
          </Tip>
        ))
      ) : (
        <Tip side="left" label={`${now.label} · ${now.range}`}>
          <button
            onClick={() => setOpen(true)}
            aria-label={`Now showing ${now.label} — choose another sky`}
            className="w-10 h-6 flex items-center justify-center cursor-pointer"
          >
            <SkyDot period={current} size={20} />
          </button>
        </Tip>
      )}
      <Tip side="left" label={open ? 'Close' : 'Skies of this day'}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close sky list' : 'Choose a sky of this day'}
          className="w-10 h-7 flex items-center justify-center cursor-pointer"
        >
          <Icon name="chevron-down" size={24} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </Tip>
    </div>
  );
}
