import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { CloudShape } from '../components/Cloud';
import PlayButton from '../components/PlayButton';
import Wordmark from '../components/Wordmark';
import useVoicePlayback from '../utils/useVoicePlayback';
import { formatDuration, formatTime } from '../utils/format';

// Stand-in for a real transcription + labelling call: short, neutral topic labels only — never emotions.
const SAMPLE_LABELS = ["Tomorrow's presentation", 'Things to finish this week', 'Call with Mom', 'Weekend plans', 'Late night thoughts', 'Quiet moment between meetings'];

export default function CloudCreatedScreen({ draft, onNext }) {
  const [suggested] = useState(() => SAMPLE_LABELS[Math.floor(Math.random() * SAMPLE_LABELS.length)]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [label, setLabel] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const voice = useVoicePlayback(draft.audioUrl, draft.duration);

  useEffect(() => {
    const t = setTimeout(() => setLoadingAI(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const finalLabel = label.trim() || suggested;

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-8 bg-gray-100 overflow-y-auto">
      <Wordmark />

      <div className="flex flex-col items-center gap-7 flex-1 justify-center w-full">
        <div className="text-center">
          <p className="text-body4 text-bluegray-400 uppercase mb-1">Your thought cloud</p>
          <h1 className="text-h3 text-bluegray-800">It's saved.</h1>
        </div>

        <div className="relative">
          <CloudShape width={220} fill="var(--color-turquoise-50)" shine />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-5">
            <PlayButton playing={voice.playing} onClick={voice.toggle} />
            <p className="text-body4 text-bluegray-500">
              {formatDuration(draft.duration)} · {formatTime(draft.timestamp)}
            </p>
          </div>
        </div>

        {/* Label */}
        <div className="w-full bg-white rounded-ooca-24 p-5 shadow-elevation-2 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${loadingAI ? 'bg-bluegray-300' : 'bg-turquoise-500'}`} />
            <p className="text-body4 text-bluegray-400 uppercase">{loadingAI ? 'Finding a label…' : 'Suggested label'}</p>
            {!loadingAI && <span className="ml-auto flex items-center gap-1 text-small text-bluegray-500 bg-turquoise-50 px-2 py-1 rounded-ooca-pill"><Icon name="magic" size={12} />AI suggested</span>}
          </div>

          {loadingAI ? (
            <div className="h-6 w-52 rounded-ooca-8 bg-turquoise-50 animate-pulse" />
          ) : editing ? (
            <input
              ref={inputRef}
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={suggested}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              className="w-full text-title1 text-bluegray-800 bg-transparent border-b-2 border-turquoise-500 outline-none pb-1 placeholder:text-bluegray-200"
            />
          ) : (
            <p className="text-title1 text-bluegray-800">{finalLabel}</p>
          )}

          {!loadingAI && (
            <div className="flex gap-5 pt-1">
              {editing ? (
                <button onClick={() => setEditing(false)} className="ooca-btn ooca-btn-text ooca-btn-turquoise">Save</button>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="ooca-btn ooca-btn-text ooca-btn-turquoise gap-1"><Icon name="edit" size={16} />Edit label</button>
                  <button onClick={() => { voice.stop(); onNext(''); }} className="ooca-btn ooca-btn-text text-bluegray-500 hover:text-bluegray-800">Leave unnamed</button>
                </>
              )}
            </div>
          )}
          <p className="text-body5 text-bluegray-400">AI only suggests a name. You decide what this thought means.</p>
        </div>
      </div>

      <div className="w-full pt-4">
        <button
          onClick={() => { voice.stop(); onNext(finalLabel); }}
          disabled={loadingAI}
          className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block"
        >
          Give it a place <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </div>
  );
}
