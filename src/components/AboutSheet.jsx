import React from 'react';
import Icon from './Icon';
import Sheet from './Sheet';

export default function AboutSheet({ onClose }) {
  return (
    <Sheet title="ooca — Thought Cloud" subtitle="UX/UI Product Designer (Design Engineer) assignment" onClose={onClose}>
      <div className="p-4 rounded-ooca-16 bg-turquoise-50 mb-5">
        <p className="text-body4 text-turquoise-900 flex items-center gap-1.5 mb-1">
          <Icon name="magic" size={14} /> Core design principle
        </p>
        <p className="text-body3 text-bluegray-800 italic">"Don't ask me to explain what's on my mind. Let me put it somewhere first."</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <section>
          <h3 className="text-subheader1 text-bluegray-800 mb-1">Why voice over typing?</h3>
          <p className="text-body3 text-bluegray-600">
            When people are overwhelmed, typing coherent sentences adds friction. Voice lets them hum, sigh, or speak in fragments without needing to make sense
            yet.
          </p>
        </section>
        <section>
          <h3 className="text-subheader1 text-bluegray-800 mb-1">AI: assistance, not interpretation</h3>
          <p className="text-body3 text-bluegray-600">
            Speech-to-text (the browser's own, in Thai or English) turns the voice into words. The thought is named after what was said most and, for voices of
            5 seconds or more, keeps up to three key points — phrases the person actually said, helpful when someone talks a lot. Nothing is read into them: no
            diagnosis, no mood, no emotion. Tap a point to name the thought after it, or type a name; if it misheard, the points can be removed. The words
            themselves are not stored. (The browser sends the audio to its speech service — Google or Apple — to do this.)
          </p>
        </section>
        <section>
          <h3 className="text-subheader1 text-bluegray-800 mb-1">The sky</h3>
          <p className="text-body3 text-bluegray-600">
            Each thought you say out loud appears as a small cloud — a Mooca. <strong>Time Sky</strong> lays thoughts out by when they happened, under a sky
            that follows the real time of day. <strong>My Skies</strong> are spaces the user names — "the system provides the space; the user defines the
            meaning."
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

      <button onClick={onClose} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block">
        Back to the sky
      </button>
    </Sheet>
  );
}
