import React from 'react';
import { formatDuration } from '../utils/format';

// Soft cloud silhouette (viewBox 220×142). Drop shadow = OOCA Elevation 03 (0 8 16 turquoise @12%).
const ELEVATION_3 = 'drop-shadow(0px 8px 16px rgba(0, 196, 179, 0.12))';

export function CloudShape({ width, fill = 'var(--color-white)', shine = false, className = '' }) {
  return (
    <svg width={width} height={(width * 142) / 220} viewBox="0 0 220 142" fill={fill} className={className} style={{ filter: ELEVATION_3 }} aria-hidden="true">
      <ellipse cx="110" cy="118" rx="92" ry="24" />
      <circle cx="48" cy="90" r="36" />
      <circle cx="100" cy="66" r="46" />
      <circle cx="158" cy="76" r="40" />
      {shine && <ellipse cx="86" cy="58" rx="22" ry="12" fill="var(--color-white)" opacity="0.5" />}
    </svg>
  );
}

// A thought cloud floating in the Time Sky
export function SkyCloud({ cloud, color, onClick, style, isNew }) {
  return (
    <button onClick={onClick} style={style} className="absolute -translate-x-1/2 cursor-pointer group" aria-label={`Open ${cloud.label}`}>
      <div className={`relative transition-transform duration-300 group-hover:-translate-y-1.5 ${isNew ? 'cloud-pop' : ''}`}>
        <CloudShape width={132} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 pb-2 px-6">
          <p className="text-body4 text-bluegray-800 w-full text-center line-clamp-2 break-words">{cloud.label}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--color-${color})` }} />
            <span className="text-small text-bluegray-500">{formatDuration(cloud.duration)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// Smaller cloud stacked inside a column of My Skies
export function MiniCloud({ cloud, onClick }) {
  const Tag = onClick ? 'button' : 'div'; // static inside tiles that are buttons themselves
  return (
    <Tag onClick={onClick} className="cursor-pointer group shrink-0" aria-label={onClick ? `Open ${cloud.label}` : undefined}>
      <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
        <CloudShape width={96} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pb-2 px-2">
          <p className="text-small text-bluegray-800 max-w-[70px] text-center line-clamp-2">{cloud.label}</p>
        </div>
      </div>
    </Tag>
  );
}
