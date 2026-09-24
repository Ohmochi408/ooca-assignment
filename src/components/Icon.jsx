import React from 'react';
import ICONS from '../icons/ooca-icons';

// OOCA DS icon (extracted from the Figma "Icon" components by scripts/figma-icons.mjs). Inherits currentColor.
export default function Icon({ name, size = 24, className = '', title }) {
  const icon = ICONS[name];
  if (!icon) {
    if (import.meta.env.DEV) console.warn(`Unknown OOCA icon "${name}"`);
    return null;
  }
  const [w, h] = icon.size;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className={`shrink-0 ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {icon.paths.map((p, i) => (
        <path key={i} d={p.d} fillRule={p.evenodd ? 'evenodd' : undefined} clipRule={p.evenodd ? 'evenodd' : undefined} />
      ))}
    </svg>
  );
}
