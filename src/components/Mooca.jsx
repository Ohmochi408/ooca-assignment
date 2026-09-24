import React, { useEffect, useState } from 'react';
import { MOOCAS } from '../data/moocas';
import { prefersReducedMotion } from '../utils/motion';

// While the voice plays, Mooca "talks": the face flips between A and B at a speech-like, uneven rhythm.
export default function Mooca({ id = 1, width, talking = false, className = '' }) {
  const m = MOOCAS[id] ?? MOOCAS[1];
  const w = width ?? m.w;
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!talking || prefersReducedMotion()) return;
    let t;
    const flip = () => {
      setMouthOpen((o) => !o);
      t = setTimeout(flip, 110 + Math.random() * 170);
    };
    t = setTimeout(flip, 0);
    return () => clearTimeout(t);
  }, [talking]);
  const open = talking && mouthOpen; // at rest the face is always A

  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: w, height: (w * m.h) / m.w }} aria-hidden="true">
      <img src={m.a} alt="" draggable="false" className={`absolute inset-0 w-full h-full select-none ${open ? 'opacity-0' : ''}`} />
      <img src={m.b} alt="" draggable="false" className={`absolute inset-0 w-full h-full select-none ${open ? '' : 'opacity-0'}`} />
    </span>
  );
}
