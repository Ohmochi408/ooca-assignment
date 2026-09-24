import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import tokens from '../../design-tokens/ooca.tokens.json';
import { SKY_PERIODS } from '../utils/skyPeriods';
import Icon, { ICON_NAMES } from '../components/Icon';
import ICONS from '../icons/ooca-icons';

// Every specimen is rendered through the CSS variables in src/styles/ooca-tokens.css,
// then the browser's computed value is compared with the value read from the Figma file.

const toRgba = (v) => {
  if (v.startsWith('#')) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)).concat(1);
  const n = v.match(/[\d.]+/g).map(Number);
  return n.length === 3 ? [...n, 1] : n;
};
const sameColor = (a, b) => toRgba(a).every((x, i) => Math.abs(x - toRgba(b)[i]) < (i === 3 ? 0.01 : 1));
const numbers = (s) => (s.match(/-?[\d.]+/g) ?? []).map(Number).sort((a, b) => a - b);
const sameNumbers = (a, b) => {
  const x = numbers(a), y = numbers(b);
  return x.length === y.length && x.every((v, i) => Math.abs(v - y[i]) < 0.01);
};

function useParity(ref, checks) {
  const [ok, setOk] = useState(null);
  useLayoutEffect(() => {
    const cs = getComputedStyle(ref.current);
    setOk(checks.every(([prop, expected, cmp = (a, b) => a === String(b)]) => cmp(cs[prop], expected)));
  }, []);
  return ok;
}

const Badge = ({ ok }) => (
  <span className={`ml-auto shrink-0 text-small px-2 py-1 rounded-ooca-pill ${ok === null ? 'bg-gray-200 text-gray-600' : ok ? 'bg-guava-100 text-guava-900' : 'bg-flamingo-100 text-flamingo-900'}`} data-parity={ok === null ? 'pending' : ok ? 'ok' : 'fail'}>
    {ok === null ? '…' : ok ? '✓ Figma' : '✘ differs'}
  </span>
);

function Swatch({ c }) {
  const ref = useRef(null);
  const ok = useParity(ref, [['backgroundColor', c.value, sameColor]]);
  return (
    <div className="flex items-center gap-3 p-2 rounded-ooca-8 bg-white">
      <div ref={ref} className="w-10 h-10 rounded-ooca-8 border border-gray-200 shrink-0" style={{ background: `var(--color-${c.token})` }} />
      <div className="min-w-0">
        <div className="text-body4 text-bluegray-900 truncate">{c.token}</div>
        <div className="text-small text-bluegray-500 truncate" title={c.figma}>{c.value} · {c.figma.split('/').slice(-2).join('/')}</div>
      </div>
      <Badge ok={ok} />
    </div>
  );
}

function TypeRow({ s, th }) {
  const ref = useRef(null);
  const style = { fontSize: `var(--text-${s.token})`, lineHeight: `var(--text-${s.token}--line-height)`, fontWeight: `var(--text-${s.token}--font-weight)` };
  const ok = useParity(ref, [
    ['fontSize', `${s.size}px`],
    ['lineHeight', `${s.lineHeight}px`],
    ['fontWeight', s.weight],
  ]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr_auto] gap-3 items-center py-3 border-b border-gray-200">
      <div>
        <div className="text-body4 text-bluegray-900">.text-{s.token}</div>
        <div className="text-small text-bluegray-500">
          EN {s.family} {s.style} {s.size}/{s.lineHeight}
          {th && <><br />TH {th.family} {th.style} {th.size}/{th.lineHeight}</>}
        </div>
      </div>
      <div ref={ref} style={style} className="text-bluegray-900 truncate">Thought Cloud 123</div>
      <div lang="th" style={style} className="text-bluegray-900 truncate">{th ? 'ความคิดของฉัน' : '— no TH style in Figma —'}</div>
      <Badge ok={ok} />
    </div>
  );
}

function ElevationCard({ e }) {
  const ref = useRef(null);
  const ok = useParity(ref, [['boxShadow', e.value, sameNumbers]]);
  return (
    <div className="flex flex-col gap-3">
      <div ref={ref} className="h-28 bg-white flex items-center justify-center text-title3 text-bluegray-700" style={{ boxShadow: `var(--shadow-${e.token})`, borderRadius: e.cardRadius }}>
        {e.figma.replace('Elevation ', '')}
      </div>
      <div className="flex items-start gap-2">
        <code className="text-small text-bluegray-600 break-all">shadow-{e.token}<br />{e.value}</code>
        <Badge ok={ok} />
      </div>
    </div>
  );
}

function RadiusBox({ r }) {
  const ref = useRef(null);
  const ok = useParity(ref, [['borderTopLeftRadius', r.value]]);
  return (
    <div className="flex flex-col gap-2 items-start">
      <div ref={ref} className="w-24 h-10 bg-turquoise-500" style={{ borderRadius: `var(--radius-${r.token})` }} />
      <div className="flex items-center gap-2 w-full">
        <code className="text-small text-bluegray-600">rounded-{r.token} · {r.value}</code>
        <Badge ok={ok} />
      </div>
    </div>
  );
}

function ButtonCell({ b }) {
  const ref = useRef(null);
  const checks = [];
  if (b.type !== 'Text') checks.push(['backgroundColor', b.background ?? 'rgba(0,0,0,0)', sameColor]);
  if (b.text) checks.push(['color', b.text, sameColor]);
  if (b.border) checks.push(['borderTopColor', b.border.color, sameColor]);
  const ok = useParity(ref, checks);
  const attrs = {
    Default: {},
    Active: { 'data-active': 'true' },
    Loading: { 'data-loading': 'true' },
    Disabled: { disabled: true },
  }[b.state];
  return (
    <div className="flex flex-col gap-2 items-start">
      <button ref={ref} className={`ooca-btn ooca-btn-${b.type.toLowerCase()} ooca-btn-${b.color.toLowerCase()}`} {...attrs}>
        {b.state === 'Loading' && b.type !== 'Text' ? <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" /> : null}
        Button
      </button>
      <Badge ok={ok} />
    </div>
  );
}

function FontStatus() {
  const [status, setStatus] = useState({});
  useEffect(() => {
    const probe = async (label, weight, text) => {
      const faces = await document.fonts.load(`${weight} 16px "OOCA Sans"`, text).catch(() => []);
      const loaded = faces.some((f) => f.status === 'loaded');
      setStatus((s) => ({ ...s, [label]: loaded }));
    };
    probe('Gotham Rounded Book (400)', 400, 'Ag');
    probe('Gotham Rounded Medium (500)', 500, 'Ag');
    probe('Gotham Rounded Bold (700)', 700, 'Ag');
    probe('Prompt Light → TH 400', 400, 'กข');
    probe('Prompt Medium → TH 500', 500, 'กข');
    probe('Prompt SemiBold → TH 700', 700, 'กข');
  }, []);
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(status).map(([k, v]) => (
        <span key={k} className={`text-body4 px-3 py-1 rounded-ooca-pill ${v ? 'bg-guava-100 text-guava-900' : 'bg-sunshade-100 text-sunshade-900'}`}>
          {v ? '✓' : '✘'} {k} {v ? 'loaded' : '— not found, using fallback'}
        </span>
      ))}
    </div>
  );
}

function Section({ id, title, count, children }) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-h3 text-bluegray-900 mb-1">{title}</h2>
      <p className="text-body5 text-bluegray-500 mb-4">{count}</p>
      {children}
    </section>
  );
}

export default function DesignSystem() {
  const [summary, setSummary] = useState({ ok: 0, fail: 0, pending: 0 });
  useEffect(() => {
    const t = setTimeout(() => {
      const all = [...document.querySelectorAll('[data-parity]')].map((n) => n.dataset.parity);
      setSummary({ ok: all.filter((x) => x === 'ok').length, fail: all.filter((x) => x === 'fail').length, pending: all.filter((x) => x === 'pending').length });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const scales = {};
  const aliases = [];
  for (const c of tokens.colors) {
    if (c.figma.startsWith('OOCA All Shades')) (scales[c.figma.split('/')[1]] ??= []).push(c);
    else aliases.push(c);
  }
  const en = tokens.typography.filter((s) => s.lang === 'en');
  const th = tokens.typography.filter((s) => s.lang === 'th');
  const shownButtons = tokens.buttons.filter((b) => b.size === 'Default' && b.icon === 'No' && ['Primary', 'Secondary', 'Text'].includes(b.type));
  const STATES = ['Default', 'Active', 'Loading', 'Disabled'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-10">
        <p className="text-body4 text-turquoise-700 mb-1">OOCA CI · generated from Figma</p>
        <h1 className="text-h1 text-bluegray-900 mb-2">Design System parity</h1>
        <p className="text-body3 text-bluegray-600 mb-4">
          Source <code>{tokens.source.file}</code>, exported {new Date(tokens.source.exportedAt).toLocaleString()}. Each specimen is drawn with the generated CSS and checked against the value stored in the .fig file. Put this page next to the matching Figma frame to compare by eye.
        </p>
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-ooca-16 bg-white shadow-elevation-2 mb-4">
          <span className="text-title2 text-bluegray-900">{summary.ok} / {summary.ok + summary.fail + summary.pending} match Figma</span>
          {summary.fail > 0 && <span className="text-body4 text-flamingo-900">{summary.fail} differ</span>}
          <span className="text-body5 text-bluegray-500 ml-auto">CLI: <code>npm run tokens:check</code></span>
        </div>
        <FontStatus />
        <nav className="flex flex-wrap gap-4 mt-6 text-body2 text-blue-500">
          {['colors', 'typography', 'elevation', 'radius', 'buttons', 'icons', 'skies'].map((s) => <a key={s} href={`#${s}`} className="underline">{s}</a>)}
        </nav>
      </header>

      <Section id="colors" title="Color" count={`${tokens.colors.length} color styles + ${tokens.gradients.length} gradient — Figma frame "Color"`}>
        {Object.entries(scales).map(([hue, list]) => (
          <div key={hue} className="mb-6">
            <h3 className="text-title3 text-bluegray-800 mb-2">{hue}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">{list.map((c) => <Swatch key={c.token} c={c} />)}</div>
          </div>
        ))}
        <h3 className="text-title3 text-bluegray-800 mb-2">Main Colors & others</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">{aliases.map((c) => <Swatch key={c.token} c={c} />)}</div>
        {tokens.gradients.map((g) => (
          <div key={g.token} className="flex items-center gap-3">
            <div className="w-40 h-16 rounded-ooca-8" style={{ background: `var(--gradient-${g.token})` }} />
            <code className="text-small text-bluegray-600">--gradient-{g.token}: {g.value}</code>
          </div>
        ))}
      </Section>

      <Section id="typography" title="Typography" count={`${en.length} EN + ${th.length} TH text styles — Figma frames "Typographic / EN" and "Typographic / TH"`}>
        <div className="bg-white rounded-ooca-16 px-4">
          {en.map((s) => <TypeRow key={s.token} s={s} th={th.find((t) => t.token === s.token)} />)}
        </div>
      </Section>

      <Section id="elevation" title="Elevation" count={`${tokens.elevation.length} levels — Figma frame "Elevation"`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-6 bg-gray-50">{tokens.elevation.map((e) => <ElevationCard key={e.token} e={e} />)}</div>
      </Section>

      <Section id="radius" title="Shapes / Radius" count={`${tokens.radius.length} radii — Figma frame "Shapes"`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{tokens.radius.map((r) => <RadiusBox key={r.token} r={r} />)}</div>
      </Section>

      <Section id="buttons" title="Button" count={`${shownButtons.length} of ${tokens.buttons.length} EN variants shown (Size=Default, Icon=No) — Figma frame "Button"`}>
        <div className="overflow-x-auto bg-white rounded-ooca-16 p-4">
          <table className="text-body4 text-bluegray-700">
            <thead>
              <tr><th className="text-left pr-6 pb-3">Type / Color</th>{STATES.map((s) => <th key={s} className="text-left pr-6 pb-3">{s}</th>)}</tr>
            </thead>
            <tbody>
              {['Primary', 'Secondary', 'Text'].flatMap((type) => ['Blue', 'Red', 'Turquoise'].map((color) => (
                <tr key={type + color}>
                  <td className="pr-6 py-3 whitespace-nowrap">{type} · {color}</td>
                  {STATES.map((state) => {
                    const b = shownButtons.find((x) => x.type === type && x.color === color && x.state === state);
                    return <td key={state} className="pr-6 py-3 align-top">{b ? <ButtonCell b={b} /> : '—'}</td>;
                  })}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Section>


      <Section id="icons" title="Icons" count={`${ICON_NAMES.length} icons extracted from Figma "Icon/…" components — scripts/figma-icons.mjs`}>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ICON_NAMES.map((n) => (
            <div key={n} className="flex flex-col items-center gap-2 p-3 bg-white rounded-ooca-8 text-bluegray-800" title={ICONS[n].figma}>
              <Icon name={n} size={32} />
              <code className="text-small text-bluegray-500 text-center">{n}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section id="skies" title="Time-of-day skies" count="5 backgrounds built from OOCA color tokens — src/styles/sky.css (not a Figma frame; concept exploration)">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {SKY_PERIODS.map((p) => (
            <figure key={p.id} className="flex flex-col gap-2">
              <div className={`sky-${p.id} relative h-80 rounded-ooca-24 overflow-hidden shadow-elevation-4`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative p-3 flex flex-col gap-3">
                  <div className="text-subheader1 text-white">Time Sky</div>
                  <div className="bg-white/90 rounded-ooca-24 p-3">
                    <div className="text-small text-bluegray-400 mb-1">09:20 AM</div>
                    <div className="text-subheader1 text-bluegray-800">Morning commute</div>
                  </div>
                  <div className="text-body5 text-white/80">Thoughts exist in moments of time.</div>
                </div>
              </div>
              <figcaption>
                <div className="text-title3 text-bluegray-900">{p.label}</div>
                <div className="text-body5 text-bluegray-500">{p.range} · <code>.sky-{p.id}</code></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </div>
  );
}
