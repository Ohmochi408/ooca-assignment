import React from 'react';
import Icon from './Icon';
import SummaryPoints from './SummaryPoints';

// Cloud ready → AI summary: for people who talk a lot, the gist at a glance. Only what was said, never what it "means".
// While the AI works it shows placeholder lines. Folds to one row (tap anywhere on it to open again) — it is never deleted.
export default function SummaryCard({ summing, points, open, onToggle }) {
  const expanded = summing || open;
  return (
    <section aria-label="AI summary" aria-busy={summing} className={`w-full rounded-ooca-24 bg-gray-100 px-4 shadow-elevation-2 fade-in ${expanded ? 'mt-6 py-2' : 'mt-4 py-1'}`}>
      {summing ? (
        <>
          <p className="flex items-center gap-1.5 min-h-10 text-body4 uppercase text-bluegray-600">
            <Icon name="magic" size={14} className="text-turquoise-500" />
            Summing up…
          </p>
          <div className="flex flex-col gap-2 py-2" aria-hidden="true">
            {['w-11/12', 'w-4/5', 'w-2/3'].map((w) => (
              <span key={w} className={`h-3 rounded-ooca-pill bg-gray-300 animate-pulse ${w}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={onToggle} aria-expanded={open} aria-controls="ai-summary-points" className="w-full flex items-center gap-1.5 min-h-10 text-left cursor-pointer">
            <Icon name="magic" size={14} className="text-turquoise-500" />
            <span className="flex-1 text-body4 uppercase text-bluegray-600">
              AI summary{!open && ` · ${points.length} points`}
            </span>
            <Icon name="chevron-down" size={20} className={`text-bluegray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
            <span className="sr-only">{open ? 'Fold summary' : 'Show summary'}</span>
          </button>
          {open && <SummaryPoints id="ai-summary-points" points={points} />}
        </>
      )}
      {expanded && <p className="mt-2 mb-1 text-body5 text-bluegray-600">Made by AI from your words — it can miss things.</p>}
    </section>
  );
}
