import React from 'react';
import { SKY_PERIODS } from '../utils/skyPeriods';

// All six skies stay mounted so switching period cross-fades (styles in src/styles/sky.css)
export default function SkyBackground({ period, className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {SKY_PERIODS.map((p) => (
        <div key={p.id} className={`sky-${p.id} absolute inset-0 transition-opacity duration-1000 ${period === p.id ? 'opacity-100' : 'opacity-0'}`} />
      ))}
    </div>
  );
}

