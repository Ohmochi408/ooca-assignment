#!/usr/bin/env node
// Reads the OOCA CI Figma file (.fig) directly and turns its published styles into code.
//
//   node scripts/figma-tokens.mjs --write   regenerate design-tokens/ooca.tokens.json + src/styles/ooca-tokens.css
//   node scripts/figma-tokens.mjs --check   verify the CSS still matches Figma and audit src/ for off-system values
//
// Optional: --fig <path> to point at a different .fig file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFig, guid } from './fig-read.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_FIG = 'ooca CI for UX_UI Assignment (Copy).fig';
const JSON_OUT = path.join(ROOT, 'design-tokens', 'ooca.tokens.json');
const CSS_OUT = path.join(ROOT, 'src', 'styles', 'ooca-tokens.css');

const args = process.argv.slice(2);
const figArg = args.includes('--fig') ? args[args.indexOf('--fig') + 1] : DEFAULT_FIG;
const FIG = path.resolve(ROOT, figArg);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const to255 = (x) => Math.round(x * 255);
const hex = ({ r, g, b }) =>
  '#' +
  [r, g, b]
    .map((x) => to255(x).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
const rgba = (c, opacity = 1) => {
  const a = +(c.a * opacity).toFixed(2);
  return a >= 1 ? hex(c) : `rgba(${to255(c.r)}, ${to255(c.g)}, ${to255(c.b)}, ${a})`;
};
const kebab = (s) => s.trim().toLowerCase().replace(/\s+/g, '-');

const WEIGHTS = { Thin: 100, ExtraLight: 200, Light: 300, Book: 400, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };

// Font files installed locally (PostScript names) + free web copies for Prompt.
const LOCAL_FACES = {
  'Gotham Rounded': { 300: ['GothamRounded-Light'], 400: ['GothamRounded-Book'], 500: ['GothamRounded-Medium'], 700: ['GothamRounded-Bold'] },
  Prompt: {
    300: ['Prompt-Light', 'Prompt Light'],
    400: ['Prompt-Regular', 'Prompt Regular'],
    500: ['Prompt-Medium', 'Prompt Medium'],
    600: ['Prompt-SemiBold', 'Prompt SemiBold'],
    700: ['Prompt-Bold', 'Prompt Bold'],
  },
};
const localSrc = (names) => names.map((n) => `local('${n}')`).join(', ');
const THAI_RANGE = 'U+0E01-0E5B, U+200C-200D, U+25CC';
const LATIN_RANGE = 'U+0000-0E00, U+0E5C-FFFF';

const HUES = {
  'OOCA Blue': 'blue',
  'OOCA Turquoise': 'turquoise',
  'OOCA Guava': 'guava',
  'OOCA Marigo': 'marigo',
  'OOCA Flamingo': 'flamingo',
  'OOCA Sunshade': 'sunshade',
  'Blue Grays': 'bluegray',
  'Black Grays': 'gray',
};

function colorToken(name) {
  const parts = name.split('/').map((s) => s.trim());
  const last = parts.at(-1);
  if (last === 'White') return 'white';
  if (last === 'Black') return 'black';
  if (parts[0] === 'OOCA All Shades and Hues') return `${HUES[parts[1]] ?? kebab(parts[1])}-${last}`;
  if (parts[0] === 'Main Colors') {
    const slug = last
      .toLowerCase()
      .replace('black gray', 'gray')
      .replace('blue gray', 'bluegray')
      .replace(/\s+/g, '')
      .replace(/(\D)(\d+)$/, '$1-$2');
    return `main-${slug}`;
  }
  if (parts[0].startsWith('Neutral')) return `neutral-${last.replace(/\D/g, '')}`;
  return kebab(parts.join('-'));
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

function extract(nodes, meta) {
  const children = new Map();
  for (const n of nodes) {
    const p = guid(n.parentIndex?.guid);
    if (!children.has(p)) children.set(p, []);
    children.get(p).push(n);
  }
  const kids = (n) => children.get(guid(n.guid)) ?? [];
  const firstText = (n) => {
    for (const c of kids(n)) {
      if (c.type === 'TEXT') return c;
      const t = firstText(c);
      if (t) return t;
    }
    return null;
  };
  const visiblePaints = (ps) => (ps ?? []).filter((p) => p.visible !== false);

  // Colors + gradients (published FILL styles)
  const colors = [];
  const gradients = [];
  for (const n of nodes.filter((n) => n.styleType === 'FILL')) {
    const p = visiblePaints(n.fillPaints)[0];
    if (!p) continue;
    if (p.type === 'SOLID') {
      const token = colorToken(n.name);
      if (colors.some((c) => c.token === token)) continue;
      colors.push({ figma: n.name, token, value: rgba(p.color, p.opacity ?? 1) });
    } else if (p.type.startsWith('GRADIENT_LINEAR')) {
      const t = p.transform;
      const angle = Math.round((Math.atan2(t.m00, -t.m01) * 180) / Math.PI + 360) % 360;
      const stops = p.stops.map((s) => `${rgba(s.color)} ${Math.round(s.position * 100)}%`).join(', ');
      gradients.push({ figma: n.name, token: kebab(n.name.split('/').at(-1)), value: `linear-gradient(${angle}deg, ${stops})` });
    }
  }
  const rank = (c) => (c.figma.startsWith('OOCA All Shades') && !['white', 'black'].includes(c.token) ? 0 : ['white', 'black'].includes(c.token) ? 1 : 2);
  const colorByValue = new Map();
  for (const c of [...colors].sort((a, b) => rank(a) - rank(b))) if (!colorByValue.has(c.value)) colorByValue.set(c.value, c.token);

  // Typography (published TEXT styles, EN + TH)
  const typography = nodes
    .filter((n) => n.styleType === 'TEXT')
    .map((n) => {
      const parts = n.name.split('/');
      return {
        figma: n.name,
        token: kebab(parts.slice(0, -1).join('-')),
        lang: parts.at(-1).trim().toLowerCase(),
        family: n.fontName.family,
        style: n.fontName.style,
        weight: WEIGHTS[n.fontName.style] ?? 400,
        size: n.fontSize,
        lineHeight: n.lineHeight?.units === 'PIXELS' ? n.lineHeight.value : null,
        letterSpacing: n.letterSpacing?.value ?? 0,
      };
    })
    .sort((a, b) => b.size - a.size || a.token.localeCompare(b.token));

  // Thai weight that pairs with each EN weight (majority vote across paired styles)
  const votes = {};
  for (const en of typography.filter((t) => t.lang === 'en')) {
    const th = typography.find((t) => t.lang === 'th' && t.token === en.token);
    if (!th) continue;
    votes[en.weight] ??= {};
    votes[en.weight][th.weight] = (votes[en.weight][th.weight] ?? 0) + 1;
  }
  const thaiWeightFor = Object.fromEntries(Object.entries(votes).map(([w, v]) => [w, +Object.entries(v).sort((a, b) => b[1] - a[1])[0][0]]));

  // Elevation: shadow cards in the "Elevation" frame, read left→right, top→bottom = 01..08
  const page = nodes.find((n) => n.type === 'CANVAS' && n.name === 'ooca CI');
  const topFrames = page ? kids(page) : [];
  const elevationFrame = topFrames.find((f) => f.name === 'Elevation');
  const elevation = kids(elevationFrame ?? {})
    .filter((n) => n.effects?.some((e) => e.type === 'DROP_SHADOW'))
    .sort((a, b) => Math.round(a.transform.m12 / 100) - Math.round(b.transform.m12 / 100) || a.transform.m02 - b.transform.m02)
    .map((n, i) => ({
      figma: `Elevation ${String(i + 1).padStart(2, '0')}`,
      token: `elevation-${i + 1}`,
      value: n.effects
        .filter((e) => e.visible !== false && e.type === 'DROP_SHADOW')
        .map((e) => `${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread ?? 0}px ${rgba(e.color)}`)
        .join(', '),
      cardRadius: n.cornerRadius ?? 0,
    }));

  // Radius: the rounded-rectangle samples in "Shapes" + the pill component + elevation cards
  const shapesFrame = topFrames.find((f) => f.name === 'Shapes' && kids(f).some((k) => k.name?.startsWith('Shapes/')));
  const pill = nodes.find((n) => n.type === 'SYMBOL' && n.name === 'Shapes/Fill/50px');
  const radii = new Set([
    ...kids(shapesFrame ?? {})
      .filter((n) => n.name?.startsWith('Shapes/Fill') && n.cornerRadius)
      .map((n) => n.cornerRadius),
    ...elevation.map((e) => e.cardRadius).filter(Boolean),
  ]);
  const radius = [
    ...[...radii].sort((a, b) => a - b).map((px) => ({ figma: `Shapes · Rounded ${px}px`, token: `ooca-${px}`, value: `${px}px` })),
    ...(pill ? [{ figma: pill.name, token: 'ooca-pill', value: `${pill.cornerRadius ?? 50}px` }] : []),
  ];

  // Buttons: every variant of the Button component set (EN only; TH differs only in label)
  const buttons = nodes
    .filter((n) => n.type === 'SYMBOL' && n.name.startsWith('Type=') && n.name.includes('Language=EN'))
    .map((n) => {
      const props = Object.fromEntries(n.name.split(',').map((kv) => kv.split('=').map((s) => s.trim())));
      const fill = visiblePaints(n.fillPaints)[0];
      const stroke = visiblePaints(n.strokePaints)[0];
      const text = firstText(n);
      const textPaint = visiblePaints(text?.fillPaints)[0];
      return {
        figma: n.name,
        type: props.Type,
        state: props.State,
        size: props.Size,
        color: props.Colors,
        icon: props.Icon,
        width: Math.round(n.size.x),
        height: Math.round(n.size.y),
        radius: n.cornerRadius ?? 0,
        background: fill?.type === 'SOLID' ? rgba(fill.color, fill.opacity ?? 1) : null,
        border: stroke?.type === 'SOLID' && n.strokeWeight ? { width: n.strokeWeight, color: rgba(stroke.color, stroke.opacity ?? 1) } : null,
        text: textPaint?.type === 'SOLID' ? rgba(textPaint.color, textPaint.opacity ?? 1) : null,
        font: text ? { style: text.fontName.style, size: text.fontSize, decoration: text.textDecoration ?? 'NONE' } : null,
      };
    });

  return {
    source: { file: path.basename(FIG), exportedAt: meta.exported_at ?? null },
    colors,
    gradients,
    typography,
    thaiWeightFor,
    elevation,
    radius,
    buttons,
    _colorByValue: colorByValue,
  };
}

// ---------------------------------------------------------------------------
// CSS generation (Tailwind v4 @theme + @font-face + button classes)
// ---------------------------------------------------------------------------

function buildCss(t) {
  const L = [];
  const colorRef = (v) => (t._colorByValue.has(v) ? `var(--color-${t._colorByValue.get(v)})` : v);
  L.push('/* AUTO-GENERATED by scripts/figma-tokens.mjs from the OOCA CI Figma file — do not edit by hand. */');
  L.push(`/* Source: ${t.source.file} (exported ${t.source.exportedAt}) */`, '');

  // Fonts: one "OOCA Sans" family. Latin glyphs → Gotham Rounded, Thai glyphs → Prompt,
  // with Thai weights remapped the way the Figma TH styles pair with the EN ones.
  L.push('/* ---- Fonts ---------------------------------------------------------- */');
  const enWeights = [...new Set(t.typography.filter((s) => s.lang === 'en').map((s) => s.weight))].sort();
  for (const w of [300, ...enWeights.filter((w) => w !== 300)]) {
    const ps = LOCAL_FACES['Gotham Rounded'][w];
    if (!ps) continue;
    L.push(`@font-face { font-family: 'OOCA Sans'; font-weight: ${w}; font-display: swap; unicode-range: ${LATIN_RANGE}; src: ${localSrc(ps)}; }`);
  }
  for (const w of enWeights) {
    const thW = t.thaiWeightFor[w] ?? w;
    const ps = LOCAL_FACES.Prompt[thW];
    L.push(
      `@font-face { font-family: 'OOCA Sans'; font-weight: ${w}; font-display: swap; unicode-range: ${THAI_RANGE}; src: ${localSrc(ps)}, url('@fontsource/prompt/files/prompt-thai-${thW}-normal.woff2') format('woff2'); }`,
    );
  }
  L.push('');

  L.push('@theme static {'); // static: keep every Figma variable even if no utility uses it yet
  L.push("  --font-sans: 'OOCA Sans', 'Nunito', 'Prompt', system-ui, sans-serif;", '');
  L.push("  /* Colors — only OOCA colors exist; Tailwind's default palette is switched off */");
  L.push('  --color-*: initial;');
  for (const c of t.colors) L.push(`  --color-${c.token}: ${c.value}; /* ${c.figma} */`);
  L.push('');
  L.push('  /* Typography (EN values; TH line-height differences are applied under :lang(th) below) */');
  L.push('  --text-*: initial;');
  for (const s of t.typography.filter((s) => s.lang === 'en')) {
    L.push(`  --text-${s.token}: ${s.size}px; /* ${s.figma} — ${s.family} ${s.style} ${s.size}/${s.lineHeight} */`);
    if (s.lineHeight) L.push(`  --text-${s.token}--line-height: ${s.lineHeight}px;`);
    L.push(`  --text-${s.token}--font-weight: ${s.weight};`);
    L.push(`  --text-${s.token}--letter-spacing: ${s.letterSpacing}px;`);
  }
  L.push('');
  L.push('  /* Elevation */');
  L.push('  --shadow-*: initial;');
  for (const e of t.elevation) L.push(`  --shadow-${e.token}: ${e.value}; /* ${e.figma} */`);
  L.push('');
  L.push('  /* Radius */');
  L.push('  --radius-*: initial;');
  for (const r of t.radius) L.push(`  --radius-${r.token}: ${r.value}; /* ${r.figma} */`);
  L.push('');
  L.push('  /* Gradients */');
  for (const g of t.gradients) L.push(`  --gradient-${g.token}: ${g.value}; /* ${g.figma} */`);
  L.push('}', '');

  const thOverrides = t.typography
    .filter((s) => s.lang === 'th')
    .map((th) => [th, t.typography.find((en) => en.lang === 'en' && en.token === th.token)])
    .filter(([th, en]) => en && th.lineHeight && th.lineHeight !== en.lineHeight);
  if (thOverrides.length) {
    L.push('/* Thai line-heights that differ from EN in Figma */');
    for (const [th] of thOverrides) L.push(`:lang(th) .text-${th.token} { line-height: ${th.lineHeight}px; } /* ${th.figma} */`);
    L.push('');
  }

  // Buttons
  L.push('/* ---- Buttons (Figma component "Button") ------------------------------ */');
  L.push('@layer components {');
  const base = t.buttons.find((b) => b.type === 'Primary' && b.state === 'Default' && b.size === 'Default');
  const baseText = t.typography.find(
    (s) => s.lang === 'en' && s.size === base?.font?.size && WEIGHTS[base?.font?.style] === s.weight && s.token.startsWith('button'),
  );
  L.push(
    `  .ooca-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: ${base.height}px; padding: 0 24px; border-radius: var(--radius-ooca-pill); border: 2px solid transparent; font-size: var(--text-${baseText.token}); line-height: var(--text-${baseText.token}--line-height); font-weight: var(--text-${baseText.token}--font-weight); white-space: nowrap; cursor: pointer; transition: background-color .15s, border-color .15s, color .15s, transform .1s; }`,
  );
  L.push('  .ooca-btn:active { transform: scale(.97); }');
  L.push('  .ooca-btn-block { width: 100%; }');
  L.push('  .ooca-btn:disabled, .ooca-btn[aria-disabled="true"] { cursor: not-allowed; transform: none; }');
  const textBtn = t.buttons.find((b) => b.type === 'Text');
  if (textBtn) {
    const tt = t.typography.find(
      (s) => s.lang === 'en' && s.size === textBtn.font.size && WEIGHTS[textBtn.font.style] === s.weight && s.token.includes('underline'),
    );
    L.push(
      `  .ooca-btn-text { height: auto; padding: 0; border: 0; border-radius: 0; background: none; text-decoration: underline; text-underline-offset: 3px; font-size: var(--text-${tt.token}); line-height: var(--text-${tt.token}--line-height); font-weight: var(--text-${tt.token}--font-weight); }`,
    );
  }
  const selector = { Default: '', Active: ':is(:hover, :focus-visible, [data-active="true"])', Loading: '[data-loading="true"]', Disabled: ':disabled' };
  const order = (list, v) => list.indexOf(v);
  const TYPES = ['Primary', 'Secondary', 'Text'],
    STATES = ['Default', 'Active', 'Loading', 'Disabled'];
  const listed = t.buttons
    .filter((b) => b.size === 'Default' && b.icon === 'No' && TYPES.includes(b.type))
    .sort((a, b) => order(TYPES, a.type) - order(TYPES, b.type) || order(STATES, a.state) - order(STATES, b.state) || a.color.localeCompare(b.color));
  for (const b of listed) {
    const cls = `.ooca-btn-${b.type.toLowerCase()}.ooca-btn-${b.color.toLowerCase()}${selector[b.state] ?? ''}`;
    const decl = [];
    if (b.type !== 'Text') {
      decl.push(`background-color: ${b.background ? colorRef(b.background) : 'transparent'}`);
      decl.push(`border-color: ${b.border ? colorRef(b.border.color) : b.background ? colorRef(b.background) : 'transparent'}`);
    }
    if (b.text) decl.push(`color: ${colorRef(b.text)}`);
    L.push(decl.length ? `  ${cls} { ${decl.join('; ')}; } /* ${b.figma} */` : `  /* ${b.figma}: spinner only, no color change */`);
  }
  L.push('}', '');
  return L.join('\n');
}

function publicJson(t) {
  return JSON.stringify({ ...t, _colorByValue: undefined }, null, 2) + '\n';
}

// ---------------------------------------------------------------------------
// --check: compare CSS on disk with Figma, then audit the app source
// ---------------------------------------------------------------------------

function parseCssVars(css) {
  const vars = new Map();
  for (const m of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
  return vars;
}

function checkTokens(t) {
  if (!fs.existsSync(CSS_OUT)) return { rows: [], problems: [`${path.relative(ROOT, CSS_OUT)} is missing — run with --write`] };
  const vars = parseCssVars(fs.readFileSync(CSS_OUT, 'utf8'));
  const problems = [];
  const expect = (figma, name, value) => {
    const got = vars.get(name);
    if (got === undefined) problems.push(`missing  --${name}  (Figma: ${figma})`);
    else if (got.replace(/\s+/g, '') !== String(value).replace(/\s+/g, '')) problems.push(`mismatch --${name}: css=${got}  figma=${value}  (${figma})`);
    return got !== undefined;
  };
  const rows = [];
  const count = (label, list, fn) => {
    let ok = 0;
    for (const x of list) if (fn(x)) ok++;
    rows.push([label, list.length, ok]);
  };
  count('Color styles', t.colors, (c) => expect(c.figma, `color-${c.token}`, c.value));
  count('Gradient styles', t.gradients, (g) => expect(g.figma, `gradient-${g.token}`, g.value));
  count(
    'Text styles (EN)',
    t.typography.filter((s) => s.lang === 'en'),
    (s) =>
      [
        expect(s.figma, `text-${s.token}`, `${s.size}px`),
        expect(s.figma, `text-${s.token}--line-height`, `${s.lineHeight}px`),
        expect(s.figma, `text-${s.token}--font-weight`, s.weight),
      ].every(Boolean),
  );
  const css = fs.readFileSync(CSS_OUT, 'utf8');
  count(
    'Text styles (TH)',
    t.typography.filter((s) => s.lang === 'th'),
    (s) => {
      const en = t.typography.find((e) => e.lang === 'en' && e.token === s.token);
      if (!en) {
        problems.push(`TH style ${s.figma} has no EN counterpart`);
        return false;
      }
      const lhOk = s.lineHeight === en.lineHeight || css.includes(`:lang(th) .text-${s.token} { line-height: ${s.lineHeight}px; }`);
      if (!lhOk) problems.push(`missing TH line-height override for ${s.figma}`);
      return lhOk;
    },
  );
  count('Elevation levels', t.elevation, (e) => expect(e.figma, `shadow-${e.token}`, e.value));
  count('Radius', t.radius, (r) => expect(r.figma, `radius-${r.token}`, r.value));
  const covered = t.buttons.filter((b) => b.size === 'Default' && b.icon === 'No' && ['Primary', 'Secondary', 'Text'].includes(b.type));
  count('Button variants (Primary/Secondary/Text × color × state)', covered, (b) => {
    const ok = css.includes(`/* ${b.figma}`);
    if (!ok) problems.push(`missing button rule for ${b.figma}`);
    return ok;
  });

  // Known, documented gaps between Figma and what CSS can express
  const notes = [];
  for (const th of t.typography.filter((s) => s.lang === 'th')) {
    const en = t.typography.find((e) => e.lang === 'en' && e.token === th.token);
    if (en && t.thaiWeightFor[en.weight] !== th.weight)
      notes.push(
        `${th.figma} is Prompt ${th.style} (${th.weight}) but shares EN weight ${en.weight}, which maps to Prompt ${t.thaiWeightFor[en.weight]} — renders one step off`,
      );
  }
  // Small / icon variants must use exactly the colors of their Default counterpart, or the shared classes are wrong
  const others = t.buttons.filter((b) => !covered.includes(b));
  count('Button variants (Small / with icon) — same colors as Default', others, (b) => {
    const base = covered.find((c) => c.type === b.type && c.state === b.state && c.color === b.color);
    const same =
      base &&
      ['background', 'text'].every((k) => b[k] === base[k] || b[k] === null || base[k] === null) &&
      (b.border?.color ?? null) === (base.border?.color ?? null);
    if (!same) notes.push(`${b.figma} has its own colors (bg ${b.background}, text ${b.text}) — not covered by .ooca-btn classes`);
    return same;
  });
  for (const en of t.typography.filter((s) => s.lang === 'en'))
    if (!t.typography.some((s) => s.lang === 'th' && s.token === en.token))
      notes.push(`${en.figma} has no TH version in Figma — Thai text in .text-${en.token} uses the default weight mapping`);
  return { rows, problems, notes };
}

const TAILWIND_ONLY_HUES = 'slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose';
const RULES = [
  {
    level: 'error',
    what: 'Tailwind default color (not in OOCA palette)',
    re: new RegExp(`\\b[a-z]+-(?:${TAILWIND_ONLY_HUES})-\\d{2,3}\\b|\\b[a-z]+-(?:blue|gray)-950\\b`, 'g'),
  },
  { level: 'error', what: 'Tailwind default font size (use an OOCA text style)', re: /\btext-(?:xs|sm|base|lg|[2-9]?xl)\b|\btext-\[\d+(?:px|rem)\]/g },
  { level: 'error', what: 'Non-OOCA radius', re: /\brounded(?:-[trblse]{1,2})?(?:-(?:sm|md|lg|xl|2xl|3xl|\[[^\]]+\]))?(?=[\s'"`]|$)/g },
  { level: 'error', what: 'Non-OOCA shadow', re: /\bshadow(?:-(?:sm|md|lg|xl|2xl|inner))?(?=[\s'"`]|$)/g },
  { level: 'warn', what: 'Overrides OOCA line-height / letter-spacing', re: /\b(?:leading|tracking)-[a-z0-9[\].]+/g },
  { level: 'warn', what: 'Weight not in Gotham Rounded (Light/Book/Medium/Bold)', re: /\bfont-(?:thin|extralight|semibold|extrabold|black)\b/g },
  { level: 'error', what: 'Emoji — use an OOCA DS icon (<Icon name>)', re: /\p{Extended_Pictographic}/gu },
  { level: 'error', what: 'Non-DS icon library — use src/components/Icon', re: /from ['"](?:lucide-react|react-icons[^'"]*|@heroicons[^'"]*)['"]/g },
];

function auditSource(t) {
  const palette = new Set(t.colors.map((c) => c.value.toUpperCase()));
  const files = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(jsx?|tsx?|html)$/.test(f.name)) files.push(p);
    }
  };
  walk(path.join(ROOT, 'src'));
  files.push(path.join(ROOT, 'index.html'));

  const findings = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (line.includes('ds-allow') || lines[i - 1]?.includes('ds-allow')) return;
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      const where = `${path.relative(ROOT, file).replace(/\\/g, '/')}:${i + 1}`;
      for (const r of RULES) for (const m of line.matchAll(r.re)) findings.push({ level: r.level, what: r.what, where, value: m[0] });
      for (const m of line.matchAll(/#[0-9a-fA-F]{6}\b/g))
        if (!palette.has(m[0].toUpperCase())) findings.push({ level: 'error', what: 'Hex color not in OOCA palette', where, value: m[0] });
    });
  }
  return findings;
}

// ---------------------------------------------------------------------------

const { nodes, meta } = readFig(FIG);
const tokens = extract(nodes, meta);

if (args.includes('--write')) {
  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.mkdirSync(path.dirname(CSS_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, publicJson(tokens));
  fs.writeFileSync(CSS_OUT, buildCss(tokens));
  console.log(`wrote ${path.relative(ROOT, JSON_OUT)} and ${path.relative(ROOT, CSS_OUT)}`);
}

if (args.includes('--check') || !args.includes('--write')) {
  const { rows, problems, notes } = checkTokens(tokens);
  console.log(`\nFigma → CSS coverage  (${tokens.source.file})\n`);
  const w = Math.max(...rows.map((r) => r[0].length));
  for (const [label, total, ok] of rows) console.log(`  ${ok === total ? '✔' : '✘'} ${label.padEnd(w)}  ${ok}/${total}`);
  for (const p of problems) console.log(`    ✘ ${p}`);
  if (notes?.length) {
    console.log('\n  Notes:');
    for (const n of notes) console.log(`    • ${n}`);
  }

  const findings = auditSource(tokens);
  const errors = findings.filter((f) => f.level === 'error');
  const warns = findings.filter((f) => f.level === 'warn');
  console.log(`\nSource audit (src/, index.html): ${errors.length} error(s), ${warns.length} warning(s)`);
  for (const f of [...errors, ...warns]) console.log(`  ${f.level === 'error' ? '✘' : '!'} ${f.where.padEnd(42)} ${f.value.padEnd(22)} ${f.what}`);

  if (problems.length || errors.length) process.exitCode = 1;
}
