import React, { useEffect, useRef } from 'react';
import Icon from './Icon';
import Mooca from './Mooca';
import RoundButton from './RoundButton';
import VoiceProgress from './VoiceProgress';
import SummaryPoints from './SummaryPoints';
import useVoicePlayback from '../utils/useVoicePlayback';
import { formatDuration } from '../utils/format';
import { scrollBehavior } from '../utils/motion';

const T = 'var(--color-turquoise-500)';
const SELECTED_OUTLINE = `drop-shadow(2px 0 0 ${T}) drop-shadow(-2px 0 0 ${T}) drop-shadow(0 2px 0 ${T}) drop-shadow(0 -2px 0 ${T}) drop-shadow(0 6px 12px color-mix(in srgb, ${T} 45%, transparent))`;

// A thought in the sky: Mooca + its Preview card. Tapping opens the player; while it plays, Mooca talks.
// Mooca is also the drag handle (grabProps from the field) — drag it to move the cloud around its sky.
export default function MoocaCloud({ cloud, meta, expanded, onExpand, onCollapse, onFavorite, onDelete, onEdit, isNew, playingId, setPlayingId, grabProps, dragging }) {
  const voice = useVoicePlayback(cloud.audioUrl, cloud.duration);
  const card = useRef(null);

  // Only one voice at a time: another cloud starting pauses this one; closing the card stops it
  useEffect(() => {
    if (voice.playing) setPlayingId(cloud.id);
  }, [voice.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!voice.playing) return;
    if (!expanded) voice.stop();
    else if (playingId && playingId !== cloud.id) voice.pause();
  }, [expanded, playingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // An opened card near the bottom scrolls up so it never sits under the record / toggle controls.
  // Only the cloud list scrolls — never scrollIntoView, which would also move the sky pager — and only on the
  // page in view: the pager keeps hidden copies of its end pages (for looping) that hold this same cloud.
  useEffect(() => {
    const el = card.current;
    if (!expanded || !el || el.closest('[aria-hidden="true"]')) return;
    const t = setTimeout(() => {
      const list = el.closest('[data-cloud-list]');
      if (!list) return;
      const box = list.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const pad = 16;
      const delta = r.bottom > box.bottom - pad ? r.bottom - box.bottom + pad : r.top < box.top + pad ? r.top - box.top - pad : 0;
      if (delta) list.scrollBy({ top: delta, behavior: scrollBehavior() });
    }, 60);
    return () => clearTimeout(t);
  }, [expanded]);

  const open = () => (expanded ? onCollapse() : onExpand());

  return (
    <div ref={card} className={`relative w-[200px] flex flex-col items-center gap-2 ${isNew ? 'cloud-arrive' : ''}`}>
      <button
        onClick={open}
        {...grabProps}
        className={`block touch-none transition-transform ${dragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:-translate-y-1'}`}
        aria-label={`${expanded ? 'Close' : 'Open'} ${cloud.label}`}
        aria-expanded={expanded}
        title={dragging ? undefined : 'Tap to open · drag to move'}
      >
        {/* Selected: a turquoise outline that follows the Mooca's own shape (stacked drop-shadows) */}
        <span className="block transition-[filter] duration-200" style={expanded ? { filter: SELECTED_OUTLINE } : undefined}>
          <Mooca id={cloud.mooca} talking={voice.playing} className={voice.playing || dragging ? '' : 'cloud-float'} />
        </span>
      </button>
      {/* Always the item's top-right corner, whatever the Mooca's size — it never moves with the float */}
      {expanded && (
        <RoundButton size={32} label={`Edit ${cloud.label}`} tip="Edit thought" tipSide="left" place="absolute top-0 right-0 z-10 fade-in" onClick={() => onEdit(cloud)}>
          <Icon name="edit-square" size={16} />
        </RoundButton>
      )}

      {expanded ? (
        <div className="w-full rounded-ooca-24 bg-gray-100 px-4 py-3 flex flex-col gap-4 shadow-elevation-3 ring-2 ring-turquoise-500 fade-in">
          <button onClick={onCollapse} className="text-left cursor-pointer">
            <p className="text-body2 text-black">{cloud.label}</p>
            <p className="text-body3 text-black">{meta}</p>
          </button>
          {/* The gist of a long voice, so it can be found again without listening to all of it */}
          {cloud.summary?.length > 0 && (
            <SummaryPoints points={cloud.summary} textClass="text-bluegray-800" className="-mt-2 border-t border-gray-300 pt-2" />
          )}
          <div className="flex flex-col gap-2">
            <VoiceProgress progress={voice.progress} duration={cloud.duration} onSeek={voice.seek} label={`Position in ${cloud.label}`} />
            <div className="flex items-center justify-between">
              <RoundButton size={32} label={cloud.favorite ? 'Remove from favorites' : 'Add to favorites'} tip={cloud.favorite ? 'Unfavorite' : 'Favorite'} pressed={cloud.favorite} onClick={() => onFavorite(cloud)} className={cloud.favorite ? 'bg-turquoise-500 text-white' : 'bg-white text-turquoise-500'}>
                <Icon name="favorite" size={18} />
              </RoundButton>
              <RoundButton size={48} label={voice.playing ? 'Pause' : 'Play'} onClick={voice.toggle} className="bg-white text-turquoise-500 shadow-elevation-3">
                <Icon name={voice.playing ? 'pause' : 'play'} size={24} className={voice.playing ? '' : 'ml-0.5'} />
              </RoundButton>
              <RoundButton size={32} label={`Remove ${cloud.label}`} tip="Remove" onClick={() => onDelete(cloud)} className="bg-white text-flamingo-500">
                <Icon name="bin" size={14} />
              </RoundButton>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={open} className="relative w-full rounded-ooca-24 bg-gray-100 px-4 py-3 text-center shadow-elevation-2 cursor-pointer hover:bg-white transition-colors">
          {/* Hearted clouds carry a small ♡, in every sky */}
          {cloud.favorite && (
            <span className="absolute top-2.5 right-3 text-turquoise-500">
              <Icon name="favorite" size={14} />
              <span className="sr-only">Favorite</span>
            </span>
          )}
          <p className={`text-body2 text-black ${cloud.favorite ? 'px-3' : ''}`}>{cloud.label}</p>
          <p className="flex justify-between text-body3 text-black">
            <span>{meta}</span>
            <span>{formatDuration(cloud.duration)}</span>
          </p>
        </button>
      )}
    </div>
  );
}
