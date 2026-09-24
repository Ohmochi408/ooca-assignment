import React from 'react';
import Icon from './Icon';

export default function AboutSheet({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div className="w-full max-h-[88%] overflow-y-auto bg-white rounded-t-ooca-24 p-6 shadow-elevation-8 screen-fade" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-h4 text-bluegray-800">ooca — Thought Cloud</h2>
            <p className="text-body4 text-turquoise-500">UX/UI Product Designer (Design Engineer) assignment</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-bluegray-500 cursor-pointer">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="p-4 rounded-ooca-16 bg-turquoise-50 mb-5">
          <p className="text-body4 text-turquoise-900 flex items-center gap-1.5 mb-1">
            <Icon name="magic" size={14} /> Core design principle
          </p>
          <p className="text-body3 text-bluegray-800 italic">"Don't ask me to explain what's on my mind. Let me put it somewhere first."</p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <section>
            <h3 className="text-subheader1 text-bluegray-800 mb-1">Why voice over typing?</h3>
            <p className="text-body3 text-bluegray-600">When people are overwhelmed, typing coherent sentences adds friction. Voice lets them hum, sigh, or speak in fragments without needing to make sense yet.</p>
          </section>
          <section>
            <h3 className="text-subheader1 text-bluegray-800 mb-1">AI: assistance, not interpretation</h3>
            <p className="text-body3 text-bluegray-600">AI only suggests a short label such as "Tomorrow's presentation". It never diagnoses, predicts moods, or names an emotion. The user decides what a thought means.</p>
          </section>
          <section>
            <h3 className="text-subheader1 text-bluegray-800 mb-1">The sky</h3>
            <p className="text-body3 text-bluegray-600">
              <strong>Time Sky</strong> lays clouds out by when they happened, under a sky that follows the real time of day. <strong>My Skies</strong> are spaces the user names — "the system provides the space; the user defines the meaning."
            </p>
          </section>
        </div>

        <div className="flex items-center justify-between p-4 rounded-ooca-16 bg-gray-100 mb-5">
          <div>
            <p className="text-subheader1 text-bluegray-800">Wittawin Archanuparb (Ohm)</p>
            <p className="text-body5 text-bluegray-500">Product Designer • TOEIC 970</p>
          </div>
          <a href="https://github.com/Ohmochi408/ooca-assignment" target="_blank" rel="noreferrer" className="ooca-btn ooca-btn-text ooca-btn-turquoise gap-1">
            GitHub <Icon name="next" size={14} />
          </a>
        </div>

        <button onClick={onClose} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block">Back to the sky</button>
      </div>
    </div>
  );
}
