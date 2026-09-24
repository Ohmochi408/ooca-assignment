import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import { CloudShape } from '../components/Cloud';
import PlayButton from '../components/PlayButton';
import ScreenHeader from '../components/ScreenHeader';
import { SkyBackdrop } from '../components/SkyBackground';
import useVoicePlayback from '../utils/useVoicePlayback';
import { formatDuration, formatTime } from '../utils/format';

// Stand-in for a real transcription + labelling call: short, neutral topic labels only — never emotions.
const SAMPLE_LABELS = ["Tomorrow's presentation", 'Things to finish this week', 'Call with Mom', 'Weekend plans', 'Late night thoughts', 'Quiet moment between meetings'];

const rise = (ms) => ({ '--rise-delay': `${ms}ms` });

// Still over the sky the thought was recorded in, so the flow reads as one continuous moment.
export default function CloudCreatedScreen({ draft, sky, onBack, onNext }) {
  const hasVoice = Boolean(draft.audioUrl);
  const returning = draft.label !== undefined; // came back from "Give it a place"
  // Without a voice there is nothing to transcribe, so there is nothing honest to suggest
  const [suggested] = useState(() => (hasVoice && !returning ? SAMPLE_LABELS[Math.floor(Math.random() * SAMPLE_LABELS.length)] : ''));
  const [loadingAI, setLoadingAI] = useState(Boolean(suggested));
  const [label, setLabel] = useState(returning ? draft.label : '');
  const [editing, setEditing] = useState(!suggested && !returning);
  const voice = useVoicePlayback(draft.audioUrl, draft.duration);

  useEffect(() => {
    if (!loadingAI) return;
    const t = setTimeout(() => setLoadingAI(false), 1600);
    return () => clearTimeout(t);
  }, [loadingAI]);

  const finalLabel = label.trim() || suggested;
  const showingSuggestion = Boolean(suggested) && !label.trim() && !editing;
  const next = (value) => {
    voice.stop();
    onNext(value);
  };

  return (
    <div className="relative h-full overflow-hidden">
      <SkyBackdrop period={sky} />

      <div className="relative h-full flex flex-col items-center justify-between px-6 py-8 overflow-y-auto">
        <div style={rise(0)} className="rise-in w-full">
          <ScreenHeader onBack={() => { voice.stop(); onBack(); }} backLabel="Re-record" onSky />
        </div>

        <div className="flex flex-col items-center gap-6 flex-1 justify-center w-full">
          <div style={rise(60)} className="rise-in text-center">
            <p className="text-body4 text-white/85 uppercase mb-1">Your thought cloud</p>
            <h1 className="text-h3 text-white">It's saved.</h1>
          </div>

          <div style={rise(120)} className="rise-in relative cloud-float">
            <CloudShape width={220} shine />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-5">
              <PlayButton playing={voice.playing} onClick={voice.toggle} />
              <p className="text-body4 text-bluegray-600">
                {formatDuration(draft.duration)} · {hasVoice ? formatTime(draft.timestamp) : 'soft chime'}
              </p>
            </div>
          </div>

          {/* Label */}
          <div style={rise(180)} className="rise-in w-full bg-white rounded-ooca-24 p-5 shadow-elevation-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full transition-colors ${loadingAI ? 'bg-bluegray-300' : 'bg-turquoise-500'}`} />
              <p className="text-body4 text-bluegray-600 uppercase">{loadingAI ? 'Finding a label…' : showingSuggestion ? 'Suggested label' : 'Label'}</p>
              {showingSuggestion && !loadingAI && (
                <span className="ml-auto flex items-center gap-1 text-body5 text-bluegray-600 bg-turquoise-50 px-2 py-1 rounded-ooca-pill">
                  <Icon name="magic" size={12} />
                  AI suggested
                </span>
              )}
            </div>

            {loadingAI ? (
              <div className="h-6 w-52 rounded-ooca-8 bg-turquoise-50 animate-pulse" />
            ) : editing ? (
              <input
                autoFocus={returning || Boolean(suggested)}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={suggested || 'e.g. Weekend plans'}
                aria-label="Label"
                onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                className="w-full text-title1 text-bluegray-800 bg-transparent border-b-2 border-turquoise-500 outline-none pb-1 placeholder:text-bluegray-300"
              />
            ) : (
              <p className="text-title1 text-bluegray-800">{finalLabel || 'Unnamed thought'}</p>
            )}

            {!loadingAI && (
              <div className="flex gap-3 -ml-2">
                {editing ? (
                  suggested && (
                    <button onClick={() => setEditing(false)} className="ooca-btn ooca-btn-text ooca-btn-turquoise min-h-11 px-2">
                      Done
                    </button>
                  )
                ) : (
                  <button onClick={() => setEditing(true)} className="ooca-btn ooca-btn-text ooca-btn-turquoise gap-1 min-h-11 px-2">
                    <Icon name="edit" size={16} />
                    Edit label
                  </button>
                )}
                {(suggested || label.trim()) && (
                  <button onClick={() => next('')} className="ooca-btn ooca-btn-text text-bluegray-600 hover:text-bluegray-800 min-h-11 px-2">
                    Leave unnamed
                  </button>
                )}
              </div>
            )}
            <p className="text-body5 text-bluegray-600">
              {hasVoice ? 'AI only suggests a name. You decide what this thought means.' : 'No voice was kept, so there is nothing to suggest from. Name it yourself, or leave it blank.'}
            </p>
          </div>
        </div>

        <div style={rise(240)} className="rise-in w-full pt-4">
          <button onClick={() => next(finalLabel)} disabled={loadingAI} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block shadow-elevation-4">
            Give it a place <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
