import React from 'react';
import Icon from './Icon';

// Back + wordmark row shared by the flow screens. onSky = white text over a sky backdrop.
export default function ScreenHeader({ onBack, backLabel = 'Back', onSky = false }) {
  const tone = onSky ? 'text-white/85 hover:text-white' : 'text-bluegray-500 hover:text-bluegray-800';
  return (
    <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center">
      {onBack ? (
        <button onClick={onBack} className={`justify-self-start -ml-2 min-h-11 px-2 flex items-center gap-1 rounded-ooca-pill text-subheader2 cursor-pointer ${tone}`}>
          <Icon name="arrow-left" size={18} /> {backLabel}
        </button>
      ) : (
        <span />
      )}
      <span className={`text-h4 select-none ${onSky ? 'text-white' : 'text-turquoise-500'}`}>ooca</span>
      <span />
    </div>
  );
}
