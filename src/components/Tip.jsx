import React from 'react';

// Hover / keyboard-focus tooltip for icon-only controls and small swatches, so nothing has to be guessed.
// Visual only — the control itself keeps its aria-label for screen readers.
// touch: on phones (no hover) the label just stays visible, since there is nothing to hover.
// className positions the wrapper (e.g. "absolute left-0"), so a tooltip never breaks the control's layout.
const SIDES = {
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
};

const POSITIONED = /\b(absolute|fixed)\b/; // the caller already positions the wrapper

export default function Tip({ label, side = 'top', touch = false, className = '', children }) {
  if (!label) return children;
  return (
    <span className={`${POSITIONED.test(className) ? '' : 'relative'} inline-flex group/tip ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-ooca-8 bg-bluegray-900 px-2 py-1 text-body5 text-white shadow-elevation-3 opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 ${touch ? '[@media(hover:none)]:opacity-100' : ''} ${SIDES[side]}`}
      >
        {label}
      </span>
    </span>
  );
}
