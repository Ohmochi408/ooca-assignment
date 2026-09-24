import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Horizontal pager: swipe on touch (native scroll-snap), drag with a mouse, ←/→ keys, arrows (ref.step(±1)),
// or the parent changing `index`. Reports the settled page through onIndexChange.
//
// loop: the last page is followed by the first (and vice versa). A copy of each end page sits beyond the
// other end; landing on a copy jumps instantly to the real page, so the glide always goes forward.
const SkyCarousel = forwardRef(function SkyCarousel({ count, index, onIndexChange, renderPage, label, loop = false }, apiRef) {
  const ref = useRef(null);
  const indexRef = useRef(index);
  const settleTimer = useRef(null);
  const forceTimer = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const mounted = useRef(false);
  const target = useRef(null); // physical page we're gliding to; scroll events until then are ours
  indexRef.current = index;

  const looping = loop && count > 1;
  const pages = looping ? count + 2 : count;
  const phys = (i) => (looping ? i + 1 : i); // logical → physical page
  const logical = (p) => (looping ? (p - 1 + count) % count : Math.min(count - 1, Math.max(0, p)));

  const width = () => Math.max(1, ref.current?.clientWidth ?? 1);
  const pageNow = () => Math.round((ref.current?.scrollLeft ?? 0) / width());
  const smooth = () => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const jump = (p) => (ref.current.scrollLeft = p * width());

  const startGlide = (p, behavior = smooth()) => {
    target.current = p;
    ref.current.scrollTo({ left: p * width(), behavior });
    // Safety net in case scroll events stop before the glide settles (e.g. tab hidden mid-animation)
    clearTimeout(forceTimer.current);
    forceTimer.current = setTimeout(() => target.current === p && settle(true), 800);
  };

  const glideTo = (p) => {
    const clamped = Math.min(pages - 1, Math.max(0, p));
    startGlide(clamped);
    const i = logical(clamped);
    if (i !== indexRef.current) onIndexChange(i); // update headers right away, not after the glide
  };

  useImperativeHandle(apiRef, () => ({ step: (dir) => glideTo((target.current ?? pageNow()) + dir) }));

  // Parent changed the page (dots, Today, calendar…) → go there, unless we're already gliding to it
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const heading = target.current !== null && logical(target.current) === index;
    if (!heading && logical(pageNow()) !== index) startGlide(phys(index), mounted.current ? smooth() : 'auto');
    else if (!mounted.current) jump(phys(index));
    mounted.current = true;
  }, [index, count]);

  // Keep the current page aligned when the frame resizes
  useEffect(() => () => clearTimeout(forceTimer.current), []);

  useEffect(() => {
    const ro = new ResizeObserver(() => ref.current && jump(phys(indexRef.current)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [looping]);

  const settle = (force = false) => {
    let p = pageNow();
    if (target.current !== null && p !== target.current) {
      if (!force) return; // still gliding
      p = target.current; // glide never finished (e.g. tab hidden) — snap to where it was going
      jump(p);
    }
    target.current = null;
    // Landed on a copy → swap to the real page without animation
    if (looping && (p === 0 || p === count + 1)) {
      p = p === 0 ? count : 1;
      jump(p);
    }
    const i = logical(p);
    if (i !== indexRef.current) onIndexChange(i);
  };

  const onScroll = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(settle, 120);
  };

  // Mouse drag (touch and trackpads already scroll natively)
  const userInput = () => (target.current = null);

  const onPointerDown = (e) => {
    userInput();
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
    ref.current.style.scrollSnapType = 'none';
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    ref.current.scrollLeft = d.left - dx;
  };
  const endDrag = (e) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const el = ref.current;
    const dx = e.clientX - d.x;
    const start = Math.round(d.left / width());
    glideTo(Math.abs(dx) > width() * 0.15 ? start + (dx < 0 ? 1 : -1) : start);
    setTimeout(() => (el.style.scrollSnapType = ''), 350);
    suppressClick.current = d.moved;
  };

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    if (looping) glideTo(pageNow() + dir);
    else if (index + dir >= 0 && index + dir < count) onIndexChange(index + dir);
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onScroll={onScroll}
      onPointerDown={onPointerDown}
      onTouchStart={userInput}
      onWheel={userInput}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.stopPropagation();
          e.preventDefault();
          suppressClick.current = false;
        }
      }}
      onKeyDown={onKeyDown}
      className="absolute inset-0 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain select-none cursor-grab active:cursor-grabbing outline-none"
    >
      {Array.from({ length: pages }, (_, p) => {
        const i = logical(p);
        const isCopy = looping && (p === 0 || p === count + 1);
        return (
          <div key={p} className="relative w-full h-full shrink-0 snap-center" aria-hidden={isCopy || i !== index} inert={isCopy || undefined}>
            {renderPage(i)}
          </div>
        );
      })}
    </div>
  );
});

export default SkyCarousel;
