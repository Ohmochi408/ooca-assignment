import React from 'react';
import Icon from './Icon';
import RoundButton from './RoundButton';

// Previous / next (day in Time Sky, sky in My Sky) — the same white tool button as every other control
export default function NavArrow({ dir, label, tip, onClick, hidden }) {
  return (
    <RoundButton label={label} tip={tip} tipSide={dir === 'left' ? 'top-start' : 'top-end'} onClick={onClick} disabled={hidden}>
      <Icon name={dir === 'left' ? 'back' : 'next'} size={24} />
    </RoundButton>
  );
}
