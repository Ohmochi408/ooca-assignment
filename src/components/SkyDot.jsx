import React from 'react';

// A time-of-day sky as a small round swatch (same CSS skies as the full backgrounds)
export default function SkyDot({ period, size = 24, className = '' }) {
  return <span className={`sky-${period} block shrink-0 rounded-full ${className}`} style={{ width: size, height: size }} aria-hidden="true" />;
}
