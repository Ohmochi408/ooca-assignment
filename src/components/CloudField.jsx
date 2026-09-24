import React from 'react';
import { SkyCloud } from './Cloud';
import { formatTime } from '../utils/format';

const ROW = 118;
const SCATTER = [30, 70, 46, 24, 74, 52];

// Clouds floating in one sky page; scrolls vertically when there are many.
// xOf(cloud, i) → left in %, or omit for a gentle scatter.
export default function CloudField({ clouds, colorOf, onOpenCloud, newCloudId, xOf, top = 132, empty }) {
  // .fg: falls away when leaving for the record screen (index.css)
  const sorted = [...clouds].sort((a, b) => a.timestamp - b.timestamp);
  return (
    <div className="fg absolute inset-0 overflow-y-auto overscroll-y-contain" style={{ '--fg-delay': '120ms' }}>
      <div className="relative" style={{ height: top + sorted.length * ROW + 200 /* clears the bottom bar */ }}>
        {sorted.map((cloud, i) => {
          const left = `${xOf ? xOf(cloud, i) : SCATTER[i % SCATTER.length]}%`;
          const y = top + i * ROW;
          return (
            <div key={cloud.id}>
              <SkyCloud cloud={cloud} color={colorOf(cloud)} isNew={cloud.id === newCloudId} onClick={() => onOpenCloud(cloud)} style={{ left, top: y }} />
              <span className="absolute -translate-x-1/2 text-small text-white bg-black/20 px-2 py-1 rounded-ooca-pill pointer-events-none" style={{ left, top: y + 90 }}>
                {formatTime(cloud.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
      {sorted.length === 0 && (
        <div className="absolute inset-x-8 top-[calc(50%-68px)] -translate-y-1/2 text-center pointer-events-none">
          <p className="text-subheader1 text-white">{empty}</p>
        </div>
      )}
    </div>
  );
}
