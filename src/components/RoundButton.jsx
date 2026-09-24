import React from 'react';
import Tip from './Tip';

// Round tool button used across the design (calendar, edit, grid, add, heart, bin, play…).
// One look for every tool: white, turquoise icon — plus a tooltip (tip, defaults to the label) so icons aren't guessed.
// place = positioning classes for the outer wrapper (the tooltip wraps the button).
export default function RoundButton({
  size = 40,
  label,
  tip,
  tipSide = 'top',
  place = '',
  onClick,
  className = 'bg-white text-turquoise-500',
  children,
  pressed,
  disabled,
}) {
  return (
    <Tip label={tip === false ? null : (tip ?? label)} side={tipSide} className={place}>
      <button
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        className={`shrink-0 rounded-full flex items-center justify-center shadow-elevation-2 transition-[transform,opacity] active:scale-95 cursor-pointer disabled:opacity-0 disabled:pointer-events-none ${className}`}
        style={{ width: size, height: size }}
      >
        {children}
      </button>
    </Tip>
  );
}
