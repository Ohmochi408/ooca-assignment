import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Mooca from './Mooca';
import MoocaCloud from './MoocaCloud';
import { scrollBehavior } from '../utils/motion';

// Thoughts drift left and right down the sky (Figma: 55% / 44% on Time Sky, 36% / 63% on My Sky) until the user moves them
const DRIFT = [55, 40, 62, 44, 58, 38];
const ROW = 236; // Mooca + card + breathing room
const COLUMN = 300; // one more column of thoughts for every 300px of width (up to 4)
const ITEM = 200; // item width
const GAP = 12; // items keep at least this much air between them
const EDGE = 8; // side margin
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Same words on every empty sky — plain, and just says how a thought gets here
const EMPTY_SKY = { title: 'No thoughts yet', line: 'Tap the mic to say what’s on your mind.' };

// The thoughts of one sky. The area stops above the record/toggle controls and below the header (soft-faded edges),
// so nothing ever slides under a tool. Drag a Mooca to place it; the spot is kept per view (time / mine / fav).
// Every thought owns its own space: one dropped on another slides to the nearest free spot, and those without a
// saved spot are laid out around the ones the user placed.
// Time Sky reads in time order; My Sky puts the newest on top (as in Figma).
export default function CloudField({ clouds, metaOf, empty = EMPTY_SKY, cloudProps, newestFirst = false, view, onMoveCloud, expandedId }) {
  const sorted = [...clouds].sort((a, b) => (newestFirst ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
  const box = useRef(null);
  const items = useRef({}); // id → element
  const dragRef = useRef(null);
  const justDragged = useRef(false);
  const [drag, setDrag] = useState(null);

  // Real sizes: the field's width and each item's height (a card grows when it opens), kept up to date by observers
  const [width, setWidth] = useState(375);
  const [heights, setHeights] = useState({});
  const ids = sorted.map((c) => c.id).join();
  useLayoutEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const measured = {};
      for (const e of entries) {
        const id = e.target.dataset.cloudId;
        if (id) measured[id] = e.target.offsetHeight;
        else setWidth(e.target.clientWidth); // the field itself
      }
      setHeights((prev) => (Object.keys(measured).some((id) => prev[id] !== measured[id]) ? { ...prev, ...measured } : prev));
    });
    ro.observe(box.current);
    Object.values(items.current).forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [ids]);

  // A thought that was just saved: scroll the list so it sits in the middle — no hunting for it.
  // Only on the page in view (the pager's hidden loop copies hold the same thought).
  const arrivingId = sorted.find((c) => cloudProps(c).isNew)?.id;
  useEffect(() => {
    const list = box.current;
    if (!arrivingId || !list || list.closest('[aria-hidden="true"]')) return;
    const t = setTimeout(() => {
      const el = items.current[arrivingId];
      if (!el) return;
      const top = el.offsetTop + el.offsetHeight / 2 - list.clientHeight / 2;
      list.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });
    }, 350); // after the sky has glided in and the items are measured
    return () => clearTimeout(t);
  }, [arrivingId]);

  const leftOf = (x) => clamp(x * width - ITEM / 2, EDGE, width - ITEM - EDGE);
  const heightOf = (id) => heights[id] || 190;
  const overlaps = (r, rects) => rects.some((o) => r.l < o.l + o.w + GAP && r.l + r.w + GAP > o.l && r.t < o.t + o.h + GAP && r.t + r.h + GAP > o.t);

  // Nearest free spot to (left, top), searched in growing rings
  const freeSpot = (left, top, h, rects) => {
    const fits = (l, t) => !overlaps({ l, t, w: ITEM, h }, rects);
    if (fits(left, top)) return { left, top };
    for (let r = 8; r < 1200; r += 8) {
      for (let k = 0; k < 16; k++) {
        const ang = (k / 16) * Math.PI * 2;
        const l = clamp(left + r * Math.cos(ang), EDGE, width - ITEM - EDGE);
        const t = Math.max(0, top + r * Math.sin(ang));
        if (fits(l, t)) return { left: l, top: t };
      }
    }
    return { left, top };
  };

  // Layout. Order of claim: the open card (it grows, so neighbours make way while it's open), then saved spots,
  // then everyone else in the default drift. A saved spot is only nudged on screen when something bigger sits there —
  // the saved value itself isn't changed.
  const layout = {};
  const placed = [];
  // Default spot: one drifting column on a phone; on wider screens a few columns, every other one a little lower,
  // so they read as clouds scattered over the sky rather than a grid
  // (never more columns than thoughts, so two thoughts spread over the sky instead of bunching on one side)
  const cols = clamp(Math.min(Math.floor((width - 2 * EDGE) / COLUMN), sorted.length), 1, 4);
  const home = (c, i) => {
    const p = c.pos?.[view];
    if (p) return { left: leftOf(p.x), top: p.y };
    if (cols === 1) return { left: leftOf(DRIFT[i % DRIFT.length] / 100), top: 12 + i * ROW };
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitter = ((DRIFT[(i + row) % DRIFT.length] - 50) / 100) * 0.5; // ±~6% of a column
    return { left: leftOf((col + 0.5 + jitter) / cols), top: 12 + row * ROW + (col % 2 ? ROW * 0.35 : 0) };
  };
  sorted
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.id !== drag?.id)
    .sort((a, b) => (b.c.id === expandedId) - (a.c.id === expandedId) || Boolean(b.c.pos?.[view]) - Boolean(a.c.pos?.[view]))
    .forEach(({ c, i }) => {
      const h = home(c, i);
      const spot = freeSpot(h.left, h.top, heightOf(c.id), placed);
      layout[c.id] = spot;
      placed.push({ l: spot.left, t: spot.top, w: ITEM, h: heightOf(c.id) });
    });
  if (drag) layout[drag.id] = { left: leftOf(drag.x), top: drag.y }; // the held one follows the pointer freely

  const height = sorted.reduce((h, c) => Math.max(h, layout[c.id].top + heightOf(c.id) + 20), 0) + 24;

  const grabProps = (c) => ({
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.stopPropagation(); // the sky pager must not swipe while a thought is held
      e.currentTarget.setPointerCapture(e.pointerId);
      const at = layout[c.id];
      const x = (at.left + ITEM / 2) / width;
      dragRef.current = { id: c.id, sx: e.clientX, sy: e.clientY, ox: x, oy: at.top, x, y: at.top, moved: false };
    },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d || d.id !== c.id) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (!d.moved && Math.hypot(dx, dy) < 6) return; // still a tap
      d.moved = true;
      d.x = clamp(d.ox + dx / width, (ITEM / 2 + EDGE) / width, 1 - (ITEM / 2 + EDGE) / width);
      d.y = Math.max(0, d.oy + dy);
      setDrag({ ...d });
    },
    onPointerUp: () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (d?.moved) {
        justDragged.current = true;
        // Dropped on top of another? Slide to the closest spot where it has room of its own
        const others = sorted.filter((o) => o.id !== c.id).map((o) => ({ l: layout[o.id].left, t: layout[o.id].top, w: ITEM, h: heightOf(o.id) }));
        const spot = freeSpot(leftOf(d.x), d.y, heightOf(c.id), others);
        onMoveCloud(c, view, { x: (spot.left + ITEM / 2) / width, y: spot.top });
      }
      setDrag(null);
    },
    onPointerCancel: () => {
      dragRef.current = null;
      setDrag(null);
    },
    onClickCapture: (e) => {
      if (!justDragged.current) return; // a drag is not a tap
      justDragged.current = false;
      e.stopPropagation();
      e.preventDefault();
    },
  });

  // No overscroll-contain: once the list ends, the scroll carries on to the next sky
  return (
    <div
      ref={box}
      data-cloud-list
      className="fg absolute inset-x-0 mx-auto max-w-[1100px] top-[100px] bottom-[180px] short:top-[76px] short:bottom-[72px] overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_16px,black_calc(100%-24px),transparent)]"
      style={{ '--fg-delay': '120ms' }}
    >
      <div className="relative" style={{ height }}>
        {sorted.map((c) => {
          const at = layout[c.id];
          const lifted = drag?.id === c.id;
          return (
            <div
              key={c.id}
              ref={(el) => {
                items.current[c.id] = el;
              }}
              data-cloud-id={c.id}
              className={`absolute ${lifted ? 'z-40' : `transition-[left,top] duration-300 ease-out ${c.id === expandedId ? 'z-30' : 'z-10'}`}`}
              style={{ left: at.left, top: at.top }}
            >
              <MoocaCloud cloud={c} meta={metaOf(c)} {...cloudProps(c)} grabProps={grabProps(c)} dragging={lifted} />
            </div>
          );
        })}
      </div>
      {sorted.length === 0 && (
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-center pointer-events-none">
          <Mooca id={3} width={110} className="opacity-90 mb-1" />
          <p className="text-title3 text-white">{empty.title}</p>
          {empty.line && <p className="text-body3 text-turquoise-50 max-w-[260px]">{empty.line}</p>}
        </div>
      )}
    </div>
  );
}
