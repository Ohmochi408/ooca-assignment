import React from 'react';
import Icon from './Icon';
import SummaryPoints from './SummaryPoints';

// Cloud ready → key points: for people who talk a lot, the gist at a glance — picked from their own words.
// Folds to one row (tap anywhere on it to open again). Tap a point to name the thought after it.
// "Misheard?" removes the points, with Undo.
// note: why there is no summary (e.g. the browser can't listen) — said plainly instead of making one up.
export default function SummaryCard({ points, open, onToggle, removed, onRemove, onUndo, note, onPick, isPicked }) {
  const row = 'flex items-center gap-1.5 min-h-10 text-body4 text-bluegray-600';

  if (note || removed) {
    return (
      <section aria-label="Summary" aria-live="polite" className="w-full mt-4 rounded-ooca-24 bg-gray-100 px-4 py-1 shadow-elevation-2 fade-in">
        <p className={row}>
          <Icon name={removed ? 'bin' : 'info'} size={14} className="shrink-0 text-bluegray-600" />
          <span className="flex-1">{removed ? 'Summary removed' : note}</span>
          {removed && (
            <button
              onClick={onUndo}
              className="shrink-0 min-h-10 -mr-2 px-3 rounded-ooca-pill text-subheader2 text-turquoise-500 hover:bg-turquoise-50 cursor-pointer"
            >
              Undo
            </button>
          )}
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Key points" className={`w-full rounded-ooca-24 bg-gray-100 px-4 shadow-elevation-2 fade-in ${open ? 'mt-4 py-2' : 'mt-4 py-1'}`}>
      <button onClick={onToggle} aria-expanded={open} aria-controls="ai-summary-points" className={`w-full text-left cursor-pointer uppercase ${row}`}>
        <Icon name="magic" size={14} className="text-turquoise-500" />
        <span className="flex-1">Key points{!open && ` · ${points.length}`}</span>
        <Icon name="chevron-down" size={20} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        <span className="sr-only">{open ? 'Fold' : 'Show'}</span>
      </button>
      {open && (
        <>
          <SummaryPoints id="ai-summary-points" points={points} onPick={onPick} isPicked={isPicked} />
          <div className="mt-2 mb-1 flex items-center justify-between gap-2">
            <p className="text-body5 text-bluegray-600">Tap one to use it as the name.</p>
            <button
              onClick={onRemove}
              className="shrink-0 min-h-8 -mr-2 px-2 rounded-ooca-pill text-body5 text-flamingo-500 underline underline-offset-2 hover:bg-flamingo-50 cursor-pointer"
            >
              Misheard? Remove
            </button>
          </div>
        </>
      )}
    </section>
  );
}
