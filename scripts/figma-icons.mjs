#!/usr/bin/env node
// Extracts OOCA DS icons (Figma components "Icon/…") from the .fig file as SVG path data.
//
//   node scripts/figma-icons.mjs            regenerate src/icons/ooca-icons.js
//   node scripts/figma-icons.mjs --list     print every icon component name in the file
//
// Only the icons listed in ICONS are emitted, so the bundle stays small. Add a line to use another one.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFig, guid } from './fig-read.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIG = path.join(ROOT, 'ooca CI for UX_UI Assignment_Latest Ver..fig');
const OUT = path.join(ROOT, 'src', 'icons', 'ooca-icons.js');

// slug used in code → Figma component name
export const ICONS = {
  mic: 'Icon/Microphone/On/Regular',
  'mic-bold': 'Icon/Microphone/On/Bold',
  'chevron-down': 'Icon/Arrow/Small/Open',
  'edit-square': 'Icon/Edit/Regular',
  'magic-bold': 'Icon/Magic wand/Bold',
  play: 'Icon/Video/Play/Bold',
  pause: 'Icon/Pause/Bold',
  'arrow-left': 'Icon/Arrow/Small/Left',
  'arrow-right': 'Icon/Arrow/Small/Right',
  back: 'Icon/Arrow/Big/Back',
  next: 'Icon/Arrow/Big/Next',
  calendar: 'Icon/Calendar/Default/Regular',
  grid: 'Icon/Dashboard/Regular',
  list: 'Icon/List/Regular',
  add: 'Icon/Add/Circle/Regular',
  'add-bold': 'Icon/Add/Circle/Bold',
  'grid-bold': 'Icon/Dashboard/Bold',
  check: 'Icon/Check/Circle/Bold',
  bin: 'Icon/Bin/Regular',
  close: 'Icon/Close',
  info: 'Icon/Information/Circle/Regular',
  edit: 'Icon/Pencil/Regular',
  time: 'Icon/Time/Regular',
  moon: 'Icon/Moon/Regular',
  sunrise: 'Icon/Sunrise/Regular',
  favorite: 'Icon/Favorite/Regular',
  lock: 'Icon/Lock/Regular',
  'lock-bold': 'Icon/Lock/Bold',
  wifi: 'Icon/Wifi1/Bold',
  folder: 'Icon/Floder file/Regular',
  home: 'Icon/Home/Regular',
  music: 'Icon/Music note/Regular',
  star: 'Icon/Rating/Star/Full/Regular',
  chat: 'Icon/Chat/Regular',
  mood: 'Icon/Mood/Regular',
  magic: 'Icon/Magic wand/Regular',
  reward: 'Icon/Reward/Regular',
  user: 'Icon/User2/Regular',
  volume: 'Icon/Volume/On/Regular',
};

const { nodes, blobs } = readFig(FIG);
const byId = new Map(nodes.map((n) => [guid(n.guid), n]));
const children = new Map();
for (const n of nodes) {
  const p = guid(n.parentIndex?.guid);
  if (!children.has(p)) children.set(p, []);
  children.get(p).push(n);
}
const kids = (n) => (children.get(guid(n.guid)) ?? []).sort((a, b) => (a.parentIndex.position < b.parentIndex.position ? -1 : 1));

if (process.argv.includes('--list')) {
  for (const n of nodes) if (n.type === 'SYMBOL' && n.name.startsWith('Icon/')) console.log(n.name);
  process.exit(0);
}

// 2×3 affine matrices as [a, b, c, d, e, f] → x' = a·x + c·y + e, y' = b·x + d·y + f
const I = [1, 0, 0, 1, 0, 0];
const fromFigma = (t) => (t ? [t.m00, t.m10, t.m01, t.m11, t.m02, t.m12] : I);
const mul = (p, q) => [
  p[0] * q[0] + p[2] * q[1],
  p[1] * q[0] + p[3] * q[1],
  p[0] * q[2] + p[2] * q[3],
  p[1] * q[2] + p[3] * q[3],
  p[0] * q[4] + p[2] * q[5] + p[4],
  p[1] * q[4] + p[3] * q[5] + p[5],
];
const r = (v) => +v.toFixed(2);

// Figma path blob: [cmd u8][float32 LE …] — 0 close, 1 move, 2 line, 3 quad, 4 cubic
function blobToPath(bytes, m) {
  const buf = Buffer.from(bytes);
  const pt = (o) => {
    const x = buf.readFloatLE(o),
      y = buf.readFloatLE(o + 4);
    return `${r(m[0] * x + m[2] * y + m[4])} ${r(m[1] * x + m[3] * y + m[5])}`;
  };
  let d = '';
  for (let o = 0; o < buf.length;) {
    const cmd = buf[o++];
    if (cmd === 0) d += 'Z';
    else if (cmd === 1) {
      d += `M${pt(o)}`;
      o += 8;
    } else if (cmd === 2) {
      d += `L${pt(o)}`;
      o += 8;
    } else if (cmd === 3) {
      d += `Q${pt(o)} ${pt(o + 8)}`;
      o += 16;
    } else if (cmd === 4) {
      d += `C${pt(o)} ${pt(o + 8)} ${pt(o + 16)}`;
      o += 24;
    } else throw new Error(`unknown path command ${cmd}`);
  }
  return d;
}

const visible = (ps) => (ps ?? []).some((p) => p.visible !== false && (p.opacity ?? 1) > 0);

function collect(node, matrix, out, isRoot = false) {
  if (node.visible === false) return;
  const m = isRoot ? I : mul(matrix, fromFigma(node.transform));
  if (!isRoot || node.type !== 'SYMBOL') {
    if (visible(node.fillPaints)) for (const g of node.fillGeometry ?? []) out.push({ d: blobToPath(blobs[g.commandsBlob].bytes, m), rule: g.windingRule });
    if (visible(node.strokePaints) && node.strokeWeight > 0)
      for (const g of node.strokeGeometry ?? []) out.push({ d: blobToPath(blobs[g.commandsBlob].bytes, m), rule: g.windingRule });
  }
  if (node.type === 'BOOLEAN_OPERATION') return; // its own geometry is already the combined shape
  if (node.type === 'INSTANCE' && node.symbolData?.symbolID) {
    const sym = byId.get(guid(node.symbolData.symbolID));
    if (sym) for (const k of kids(sym)) collect(k, m, out);
    return;
  }
  for (const k of kids(node)) collect(k, m, out);
}

const icons = {};
const missing = [];
for (const [slug, name] of Object.entries(ICONS)) {
  const sym = nodes.find((n) => n.type === 'SYMBOL' && n.name === name);
  if (!sym) {
    missing.push(name);
    continue;
  }
  const paths = [];
  collect(sym, I, paths, true);
  icons[slug] = {
    figma: name,
    size: [r(sym.size.x), r(sym.size.y)],
    paths: paths.map((p) => (p.rule === 'ODD' ? { d: p.d, evenodd: true } : { d: p.d })),
  };
}
if (missing.length) {
  console.error('Missing icon components:', missing.join(', '));
  process.exitCode = 1;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  '// AUTO-GENERATED by scripts/figma-icons.mjs from the OOCA CI Figma file — do not edit by hand.\n' + `export default ${JSON.stringify(icons, null, 2)};\n`,
);
console.log(`wrote ${path.relative(ROOT, OUT)} (${Object.keys(icons).length} icons)`);
