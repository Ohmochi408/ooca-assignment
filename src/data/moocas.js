import m1a from '../assets/mooca/mooca1-a.svg';
import m1b from '../assets/mooca/mooca1-b.svg';
import m2a from '../assets/mooca/mooca2-a.svg';
import m2b from '../assets/mooca/mooca2-b.svg';
import m3a from '../assets/mooca/mooca3-a.svg';
import m3b from '../assets/mooca/mooca3-b.svg';
import m4a from '../assets/mooca/mooca4-a.svg';
import m4b from '../assets/mooca/mooca4-b.svg';
import m5a from '../assets/mooca/mooca5-a.svg';
import m5b from '../assets/mooca/mooca5-b.svg';

// The five Mooca clouds from the Figma design (Ideate2 → Main Design). A = resting face, B = mouth open.
// Natural sizes are the Figma frame sizes; the aspect ratio is kept when a width is given.
export const MOOCAS = {
  1: { a: m1a, b: m1b, w: 132, h: 85 },
  2: { a: m2a, b: m2b, w: 148, h: 96 },
  3: { a: m3a, b: m3b, w: 135, h: 87 },
  4: { a: m4a, b: m4b, w: 195, h: 116 },
  5: { a: m5a, b: m5b, w: 182, h: 117 },
};
const MOOCA_IDS = [1, 2, 3, 4, 5];
// Random pick for a new thought; pass the last one used so two clouds in a row never look the same
export const randomMooca = (not) => {
  const pool = MOOCA_IDS.filter((id) => id !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};
