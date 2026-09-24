import React from 'react';
import Icon from './Icon';

// Key points of a voice as short turquoise-dot points (Cloud ready card and the open card in the sky).
// With onPick each point is a button that names the thought after it; the one in use shows a check.
export default function SummaryPoints({ points, id, className = '', textClass = 'text-black', onPick, isPicked }) {
  return (
    <ul id={id} aria-label="Key points" className={`flex flex-col gap-1 ${className}`}>
      {points.map((p) => {
        const picked = isPicked?.(p);
        const mark = picked ? (
          <Icon name="check" size={14} className="shrink-0 mt-[3px] text-turquoise-500" />
        ) : (
          <span className="mt-[7px] mx-[4px] w-1.5 h-1.5 shrink-0 rounded-full bg-turquoise-500" aria-hidden="true" />
        );
        return (
          <li key={p} className={`text-body3 ${textClass}`}>
            {onPick ? (
              <button
                onClick={() => onPick(p)}
                aria-pressed={picked}
                aria-label={`${p} — use as the name`}
                className="w-[calc(100%+16px)] flex gap-2 -mx-2 px-2 py-0.5 rounded-ooca-8 text-left cursor-pointer hover:bg-white"
              >
                {mark}
                <span>{p}</span>
              </button>
            ) : (
              <span className="flex gap-2">
                {mark}
                {p}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
