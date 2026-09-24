import React from 'react';

// The AI summary of a voice as short turquoise-dot points (Cloud ready card and the open card in the sky)
export default function SummaryPoints({ points, id, className = '', textClass = 'text-black' }) {
  return (
    <ul id={id} aria-label="AI summary" className={`flex flex-col gap-1 ${className}`}>
      {points.map((p) => (
        <li key={p} className={`flex gap-2 text-body3 ${textClass}`}>
          <span className="mt-[7px] w-1.5 h-1.5 shrink-0 rounded-full bg-turquoise-500" aria-hidden="true" />
          {p}
        </li>
      ))}
    </ul>
  );
}
