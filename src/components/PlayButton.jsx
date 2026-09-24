import React from 'react';
import Icon from './Icon';

export default function PlayButton({ playing, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={playing ? 'Stop voice' : 'Play voice'}
      className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-elevation-4 transition-all duration-200 cursor-pointer ${
        playing ? 'bg-turquoise-900 scale-95' : 'bg-turquoise-500 hover:scale-105'
      }`}
    >
      {playing ? (
        <span className="flex gap-1 items-center" aria-hidden="true">
          {[10, 13, 16].map((h, i) => (
            <span key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      ) : (
        <Icon name="play" size={26} className="ml-0.5" />
      )}
    </button>
  );
}
