import React, { useEffect, useRef } from 'react';
import { SkyCloud, cloudWidth, cloudHeight } from './Cloud';
import { formatTime } from '../utils/format';

const ROW = 132;
const SCATTER = [30, 70, 46, 24, 74, 52];

// Clouds floating in one sky page; scrolls vertically when there are many.
// xOf(cloud, i) → left in %, or omit for a gentle scatter.
export default function CloudField({ clouds, colorOf, onOpenCloud, newCloudId, xOf, top = 132, empty }) {
  // .fg: falls away when leaving for the record screen (index.css)
  const sorted = [...clouds].sort((a, b) => a.timestamp - b.timestamp);
  // A cloud that just arrived may sit below the fold — bring it into view before it rises in
  const scroller = useRef(null);
  const newIndex = sorted.findIndex((c) => c.id === newCloudId);
  useEffect(() => {
    const el = scroller.current;
    if (!el || newIndex < 0) return;
    el.scrollTop = Math.max(0, top + newIndex * ROW - el.clientHeight / 2 + 60);
  }, [newIndex, top]);
  return (
    <div ref={scroller} className="fg absolute inset-0 overflow-y-auto overscroll-y-contain" style={{ '--fg-delay': '120ms' }}>
      <div className="relative" style={{ height: top + sorted.length * ROW + 230 /* clears the pager + bottom bar */ }}>
        {sorted.map((cloud, i) => {
          const w = cloudWidth(cloud.label);
          const edge = w / 2 + 8; // keep wide clouds inside the screen
          const left = `clamp(${edge}px, ${xOf ? xOf(cloud, i) : SCATTER[i % SCATTER.length]}%, calc(100% - ${edge}px))`;
          const y = top + i * ROW;
          return (
            <div key={cloud.id}>
              <SkyCloud cloud={cloud} color={colorOf(cloud)} isNew={cloud.id === newCloudId} onClick={() => onOpenCloud(cloud)} style={{ left, top: y }} />
              <span className={`absolute -translate-x-1/2 text-body4 text-white bg-black/30 px-2 py-0.5 rounded-ooca-pill pointer-events-none ${cloud.id === newCloudId ? 'fade-in' : ''}`} style={{ left, top: y + cloudHeight(w) + 4 }}>
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
