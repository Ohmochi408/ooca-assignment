import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import SkyBackground from '../components/SkyBackground';
import SkyDot from '../components/SkyDot';
import Tip from '../components/Tip';
import Mooca from '../components/Mooca';
import RoundButton from '../components/RoundButton';
import VoiceProgress from '../components/VoiceProgress';
import SummaryCard from '../components/SummaryCard';
import useVoicePlayback from '../utils/useVoicePlayback';
import useMediaQuery from '../utils/useMediaQuery';
import { riseDelay } from '../utils/motion';
import { SKY_PERIODS, periodById } from '../utils/skyPeriods';
import { nameAndPoints, nameFrom, noSummaryReason } from '../utils/aiSummary';

const longDate = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const iconFor = (style) => (style === 'night' || style === 'midnight' ? 'moon' : style === 'dawn' ? 'sunrise' : 'star');

// Ideate2 → "Cloud ready" (+ "New sky" and the open "Pick sky" dropdown).
// One screen to listen back, name the cloud and — only if they want — give it a My Sky. "None" keeps it in Time Sky only.
// Also used to edit a saved cloud (mode = 'edit').
// Phone: one column. Large screens: two — listening (name, Mooca, player) on the left, deciding (summary, sky) on the right.
export default function CloudReadyScreen({ cloud, mode = 'new', skies, backdrop, onDone, onDiscard, onCancel }) {
  const voice = useVoicePlayback(cloud.audioUrl, cloud.duration);
  // New voices: a name and key points from what was said most (utils/aiSummary.js), worked out once.
  // Editing keeps what was saved.
  const [ai] = useState(() => (mode === 'new' && cloud.audioUrl ? nameAndPoints(cloud.transcript, cloud.duration) : null));
  const suggested = ai?.title ?? null;
  const [label, setLabel] = useState(suggested ?? cloud.label);
  const [renaming, setRenaming] = useState(false);
  const [favorite, setFavorite] = useState(Boolean(cloud.favorite));
  const [skyId, setSkyId] = useState(cloud.skyId ?? null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStyle, setNewStyle] = useState(backdrop ?? 'midnight');
  const newSkyRef = useRef(null); // the "Name new Sky here" field
  const nameBefore = useRef(label); // restored if a rename is cancelled or left empty
  const menuRef = useRef(null);

  // Key points: fold them away, or remove them when speech-to-text misheard (Undo brings them back)
  const [summary, setSummary] = useState(ai ? ai.summary : (cloud.summary ?? null));
  const [removedSummary, setRemovedSummary] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const hasSummary = summary?.length > 0;
  const summaryNote = ai && !ai.summary ? noSummaryReason(cloud.transcript, cloud.duration) : null;
  const twoColumns = useMediaQuery('(min-width: 1024px)');
  const compact = !twoColumns && hasSummary && summaryOpen; // on one column, make room for the open key points

  const chosen = skies.find((s) => s.id === skyId);
  const canSave = label.trim() && (!creating || newName.trim());

  useEffect(() => {
    if (creating) newSkyRef.current?.focus();
  }, [creating]);

  // Escape leaves an edit without saving (unless it's closing the dropdown or the rename field)
  useEffect(() => {
    if (mode !== 'edit') return;
    const esc = (e) => e.key === 'Escape' && !menuOpen && !renaming && onCancel();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [mode, menuOpen, renaming, onCancel]);

  // Close the dropdown on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const off = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
    const esc = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('pointerdown', off);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', off);
      window.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  const pick = (id) => {
    setMenuOpen(false);
    if (id === 'new') return setCreating(true);
    setCreating(false);
    setSkyId(id);
  };

  const done = () => {
    if (!canSave) return;
    voice.stop();
    onDone({
      label: label.trim(),
      favorite,
      summary,
      skyId: creating ? null : skyId,
      newSky: creating ? { name: newName.trim(), style: newStyle, icon: iconFor(newStyle) } : null,
    });
  };

  const surprise = () => {
    const others = SKY_PERIODS.filter((p) => p.id !== newStyle);
    setNewStyle(others[Math.floor(Math.random() * others.length)].id);
  };

  const row = 'w-full h-10 px-4 flex items-center gap-2 text-body3 text-left';

  return (
    <div className="relative h-full overflow-hidden">
      <SkyBackground period={backdrop} />

      <div className="relative h-full overflow-y-auto">
        <div className="relative min-h-full mx-auto w-full max-w-[420px] px-4 pt-8 pb-9 short:pt-4 flex flex-col lg:max-w-[960px] lg:grid lg:grid-cols-2 lg:gap-x-16 lg:content-center">
          {/* Editing a saved cloud can always be left without changing anything — the same white tool button as
              everywhere else, so it reads on every sky (bare white text disappears on the bright ones) */}
          {mode === 'edit' && (
            <RoundButton
              size={40}
              label="Cancel — leave without saving"
              tip="Cancel"
              tipSide="bottom"
              place="absolute left-4 top-8 z-10"
              onClick={() => {
                voice.stop();
                onCancel();
              }}
            >
              <Icon name="close" size={20} />
            </RoundButton>
          )}
          {/* Listen: name, Mooca and the player */}
          <div className="flex flex-col">
            <div style={riseDelay(0)} className="rise-in flex flex-col items-center gap-4">
              {/* Cloud name: always centred on the screen. Tap the name to type (iOS-style); the pencil trails the text as a
                  hint that it can be renamed, but hangs outside the text box so it never pushes the name off centre.
                  px-12 keeps both sides clear — Cancel (edit mode) on the left, the pencil on the right. */}
              <div className="relative flex justify-center min-h-10 w-full px-12">
                {renaming ? (
                  <span className="relative flex w-full max-w-[240px]">
                    <input
                      autoFocus
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onBlur={() => {
                        if (!label.trim()) setLabel(nameBefore.current); // never leave a cloud without a name
                        setRenaming(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && label.trim()) setRenaming(false);
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setLabel(nameBefore.current); // Escape = keep the old name
                          setRenaming(false);
                        }
                      }}
                      aria-label="Thought name"
                      maxLength={40}
                      className="w-full text-h4 text-white text-center bg-transparent border-b-2 border-white/80 outline-none placeholder:text-white/60"
                      placeholder="Name this thought"
                    />
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2">
                      <RoundButton size={32} label="Done naming" tip="Done" onClick={() => label.trim() && setRenaming(false)}>
                        <Icon name="check" size={16} />
                      </RoundButton>
                    </span>
                  </span>
                ) : (
                  <Tip label="Rename" side="bottom">
                    <button
                      onClick={() => {
                        nameBefore.current = label;
                        setRenaming(true);
                      }}
                      aria-label={`${label} — rename`}
                      className="relative rounded-ooca-8 px-1 text-left cursor-text hover:bg-white/10"
                    >
                      <h1 className="text-h4 text-white text-center break-words">{label}</h1>
                      <span
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-8 h-8 rounded-full bg-white text-turquoise-500 shadow-elevation-2 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <Icon name="edit-square" size={16} />
                      </span>
                    </button>
                  </Tip>
                )}
              </div>
              <p className="text-body1 text-turquoise-50">{longDate(cloud.timestamp)}</p>
              {suggested && label === suggested && !renaming && (
                <p className="-mt-2 flex items-center gap-1.5 text-body4 text-white bg-black/30 rounded-ooca-pill px-3 py-1 fade-in" aria-live="polite">
                  <Icon name="magic" size={14} />
                  Named from what you talked about most — tap to change
                </p>
              )}
            </div>

            {/* Mooca + player */}
            <div style={riseDelay(80)} className={`rise-in flex flex-col items-center ${compact ? 'mt-6' : 'mt-10'}`}>
              <Mooca id={cloud.mooca} width={compact ? 140 : 195} talking={voice.playing} className={voice.playing ? '' : 'cloud-float'} />
              <div className={`w-full ${compact ? 'mt-6' : 'mt-12'}`}>
                <VoiceProgress progress={voice.progress} duration={cloud.duration} onSeek={voice.seek} thick onSky label={`Position in ${label}`} />
              </div>
              <RoundButton
                size={56}
                label={voice.playing ? 'Pause' : 'Play'}
                onClick={voice.toggle}
                className={`bg-white text-turquoise-500 shadow-elevation-3 ${compact ? 'mt-3' : 'mt-6'}`}
              >
                <Icon name={voice.playing ? 'pause' : 'play'} size={24} className={voice.playing ? '' : 'ml-0.5'} />
              </RoundButton>
              {!cloud.audioUrl && (
                <p className="text-body4 text-white bg-black/30 rounded-ooca-8 px-3 py-2 mt-3">No voice was kept — this plays a soft chime.</p>
              )}
            </div>
          </div>

          {/* Decide: the key points, then which sky it goes to */}
          <div className="flex-1 flex flex-col lg:justify-center">
            {(hasSummary || removedSummary || summaryNote) && (
              <SummaryCard
                points={summary}
                open={summaryOpen}
                onToggle={() => setSummaryOpen((o) => !o)}
                removed={Boolean(removedSummary)}
                onRemove={() => {
                  setRemovedSummary(summary);
                  setSummary([]); // [] = removed on purpose, and saved that way
                }}
                onUndo={() => {
                  setSummary(removedSummary);
                  setRemovedSummary(null);
                }}
                note={summaryNote}
                onPick={(p) => {
                  const name = nameFrom(p);
                  setLabel(name);
                  nameBefore.current = name;
                }}
                isPicked={(p) => nameFrom(p) === label}
              />
            )}

            {/* Pick your Sky */}
            <div style={riseDelay(160)} className={`rise-in mt-auto lg:mt-6 lg:pt-0 ${compact ? 'pt-5' : 'pt-8'}`}>
              <div className="relative rounded-ooca-24 bg-gray-100 p-4 flex flex-col gap-4 shadow-elevation-2" ref={menuRef}>
                <p className="text-title2 text-turquoise-900 text-center" id="pick-sky-label">
                  Pick your Sky
                </p>

                {creating ? (
                  <div className="h-10 rounded-ooca-24 bg-white shadow-elevation-2 flex items-center gap-2 pl-4 pr-2">
                    <SkyDot period={newStyle} size={24} className="ring-2 ring-turquoise-500" />
                    <input
                      ref={newSkyRef}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && done()}
                      maxLength={32}
                      placeholder="Name new Sky here"
                      aria-label="New sky name"
                      className="min-w-0 flex-1 text-body3 text-black bg-transparent outline-none placeholder:text-gray-400"
                    />
                    <button
                      onClick={() => setMenuOpen((o) => !o)}
                      aria-label="Choose an existing sky instead"
                      aria-expanded={menuOpen}
                      className="w-8 h-8 flex items-center justify-center cursor-pointer"
                    >
                      <Icon name="chevron-down" size={24} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={menuOpen}
                    aria-labelledby="pick-sky-label"
                    className="h-10 rounded-ooca-24 bg-white shadow-elevation-2 flex items-center gap-2 pl-4 pr-2 cursor-pointer"
                  >
                    {chosen && <SkyDot period={chosen.style} size={24} />}
                    <span className={`flex-1 text-left text-body3 ${chosen ? 'text-black' : 'text-bluegray-600'}`}>{chosen?.name ?? 'None'}</span>
                    <Icon name="chevron-down" size={24} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {creating && (
                  <p className="-mt-2 text-body5 text-bluegray-600 text-center" aria-live="polite">
                    {periodById(newStyle).label} sky · {periodById(newStyle).range}
                    {!newName.trim() && ' — name it to save'}
                  </p>
                )}

                {menuOpen && (
                  <ul
                    role="listbox"
                    aria-labelledby="pick-sky-label"
                    className="absolute left-4 right-4 bottom-[calc(100%-4px)] z-20 rounded-ooca-24 bg-white shadow-elevation-6 overflow-hidden fade-in"
                  >
                    <li>
                      <button onClick={() => pick('new')} className={`${row} text-black hover:bg-turquoise-50 cursor-pointer`}>
                        + Create new
                      </button>
                    </li>
                    {skies.map((s) => {
                      const on = !creating && s.id === skyId;
                      return (
                        <li key={s.id} role="option" aria-selected={on}>
                          <button
                            onClick={() => pick(s.id)}
                            className={`${row} rounded-ooca-24 cursor-pointer ${on ? 'bg-turquoise-500 text-white' : 'text-black hover:bg-turquoise-50'}`}
                          >
                            <SkyDot period={s.style} size={24} />
                            <span className="truncate">{s.name}</span>
                          </button>
                        </li>
                      );
                    })}
                    <li role="option" aria-selected={!creating && !skyId}>
                      <button
                        onClick={() => pick(null)}
                        className={`${row} rounded-ooca-24 cursor-pointer ${!creating && !skyId ? 'bg-turquoise-500 text-white' : 'text-black hover:bg-turquoise-50'}`}
                      >
                        None
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {/* New sky: which of the six skies it looks like */}
              {creating && (
                <div
                  className="mt-2 h-10 rounded-ooca-24 bg-white shadow-elevation-2 flex items-center justify-between px-4 fade-in"
                  role="radiogroup"
                  aria-label="Sky style"
                >
                  {SKY_PERIODS.slice(1)
                    .concat(SKY_PERIODS[0])
                    .map((p) => (
                      <Tip key={p.id} label={`${p.label} · ${p.range}`}>
                        <button
                          role="radio"
                          aria-checked={newStyle === p.id}
                          aria-label={`${p.label} sky, ${p.range}`}
                          onClick={() => setNewStyle(p.id)}
                          className="w-8 h-8 flex items-center justify-center cursor-pointer"
                        >
                          <SkyDot period={p.id} size={24} className={newStyle === p.id ? 'ring-2 ring-turquoise-500' : ''} />
                        </button>
                      </Tip>
                    ))}
                  <Tip label="Surprise me">
                    <button
                      onClick={surprise}
                      aria-label="Surprise me — pick a sky at random"
                      className="w-8 h-8 flex items-center justify-center cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center">
                        <Icon name="magic-bold" size={16} />
                      </span>
                    </button>
                  </Tip>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-8">
                <RoundButton
                  size={40}
                  label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  pressed={favorite}
                  onClick={() => setFavorite((f) => !f)}
                  className={favorite ? 'bg-turquoise-500 text-white' : 'bg-white text-turquoise-500'}
                >
                  <Icon name="favorite" size={20} />
                </RoundButton>
                <button onClick={done} disabled={!canSave} className="ooca-btn ooca-btn-primary ooca-btn-turquoise flex-1">
                  {mode === 'edit' ? 'Save' : 'Done!'}
                </button>
                <RoundButton
                  size={40}
                  label={mode === 'edit' ? 'Remove this thought' : 'Discard this thought'}
                  onClick={() => {
                    voice.stop();
                    onDiscard();
                  }}
                  className="bg-white text-flamingo-500"
                >
                  <Icon name="bin" size={16} />
                </RoundButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
