import React, { useState } from 'react';
import Icon from '../components/Icon';
import Tip from '../components/Tip';
import RoundButton from '../components/RoundButton';
import TimeSky from './sky/TimeSky';
import MySkies from './sky/MySkies';

// Ideate2 → Main Design: the sky screen — Time Sky or My Sky, with the record button and the view toggle.
// Which sky is on screen (timeNav / myIndex) lives in App, so it is kept while visiting other screens.
export default function SkyScreen({ clouds, skies, view, setView, timeNav, setTimeNav, myIndex, setMyIndex, newCloudId, leaving, onAddThought, onEditCloud, onFavorite, onDeleteCloud, onMoveCloud, onCreateSky, onUpdateSky }) {
  const [expandedId, setExpandedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [form, setForm] = useState(null); // My Sky: null | 'new' | sky
  const [showAll, setShowAll] = useState(false);

  const cloudProps = (c) => ({
    expanded: expandedId === c.id,
    onExpand: () => setExpandedId(c.id),
    onCollapse: () => setExpandedId(null),
    onFavorite,
    onDelete: (cloud) => {
      setExpandedId(null);
      onDeleteCloud(cloud);
    },
    onEdit: onEditCloud,
    isNew: c.id === newCloudId,
    playingId,
    setPlayingId,
  });

  // The sky currently on screen — the record screen keeps it as its background
  const currentSky = view === 'time' ? timeNav.period : skies[Math.min(myIndex, skies.length - 1)]?.style;
  // Moving to another sky closes the open card
  const withClosedCard = (set) => (v) => {
    setExpandedId(null);
    set(v);
  };
  const switchView = (v) => {
    setExpandedId(null);
    setShowAll(false);
    setView(v);
  };

  return (
    <div className={`relative h-full overflow-hidden ${leaving ? 'sky-leaving' : ''}`}>
      <div className="absolute inset-0">
        {view === 'time' ? (
          <TimeSky clouds={clouds} nav={timeNav} setNav={withClosedCard(setTimeNav)} cloudProps={cloudProps} onMoveCloud={onMoveCloud} expandedId={expandedId} />
        ) : (
          <MySkies
            clouds={clouds}
            skies={skies}
            index={myIndex}
            setIndex={withClosedCard(setMyIndex)}
            cloudProps={cloudProps}
            onMoveCloud={onMoveCloud}
            expandedId={expandedId}
            onCreateSky={onCreateSky}
            onUpdateSky={onUpdateSky}
            form={form}
            setForm={setForm}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}
      </div>

      {/* Soft white glow rising from the horizon behind the controls */}
      <div className="fg absolute inset-x-0 bottom-0 h-[260px] pointer-events-none z-10 bg-[radial-gradient(400px_400px_at_50%_calc(100%+250px),var(--color-white),color-mix(in_srgb,var(--color-white)_50%,transparent)_50%,transparent)]" aria-hidden="true" />

      {/* Record */}
      <div className="fg absolute bottom-[107px] inset-x-0 z-30 flex justify-center pointer-events-none">
        <Tip label="Record a thought" className="pointer-events-auto">
          <button
            onClick={() => onAddThought(currentSky)}
            disabled={leaving}
            aria-label="Add a thought"
            className="w-16 h-16 rounded-full bg-white shadow-elevation-3 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="w-[55px] h-[55px] rounded-full bg-turquoise-500 text-white flex items-center justify-center">
              <Icon name="mic-bold" size={31} />
            </span>
          </button>
        </Tip>
      </div>

      {/* Toggle (+ My Sky: all skies / new sky) */}
      <div className="fg absolute bottom-[34px] inset-x-4 z-30 flex items-center justify-center">
        {view === 'mine' && (
          <RoundButton size={40} label={showAll ? 'Back to one sky' : 'Show all skies'} tip={showAll ? 'One sky' : 'All skies'} tipSide="top-start" place="absolute left-0" pressed={showAll} onClick={() => setShowAll((s) => !s)} className={showAll ? 'bg-turquoise-500 text-white' : 'bg-white text-turquoise-500'}>
            <Icon name="grid" size={20} />
          </RoundButton>
        )}
        <div className="flex p-1 rounded-ooca-pill bg-white shadow-elevation-2" role="tablist" aria-label="Sky view">
          {[
            ['time', 'Time Sky'],
            ['mine', 'My Sky'],
          ].map(([v, label]) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => switchView(v)}
              className={`w-[100px] h-10 rounded-ooca-pill text-button-small transition-colors cursor-pointer ${view === v ? 'bg-turquoise-500 text-white' : 'text-turquoise-500 hover:bg-turquoise-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {view === 'mine' && (
          <RoundButton size={40} label="Create a new sky" tip="New sky" tipSide="top-end" place="absolute right-0" onClick={() => setForm('new')}>
            <Icon name="add" size={20} />
          </RoundButton>
        )}
      </div>
    </div>
  );
}
