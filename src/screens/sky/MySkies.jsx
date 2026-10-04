import React, { useRef, useState } from 'react';
import Icon from '../../components/Icon';
import RoundButton from '../../components/RoundButton';
import NavArrow from '../../components/NavArrow';
import SkyCarousel from '../../components/SkyCarousel';
import SkyBackground from '../../components/SkyBackground';
import CloudField from '../../components/CloudField';
import AllSkies from './AllSkies';
import SkyFormSheet from '../../components/SkyFormSheet';
import ShareSheet from '../../components/ShareSheet';
import { sharesOf, whoOf, dayOf } from '../../data/session';
import { cloudCount } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { HEADER, ARROWS } from './layout';

// Recording doesn't fill Favorites — hearting does, so it says so
const EMPTY_FAVORITES = { title: 'No favorites yet', line: 'Tap ♡ on a thought to keep it here.' };

// Ideate2 → "My Sky": one sky per space the user defined, after the system's Favorites sky (index 0).
// showAll = the "All skies" grid. form = the sky sheet being edited: null | 'new' | a sky.
export default function MySkies({
  clouds,
  skies,
  index,
  setIndex,
  cloudProps,
  onMoveCloud,
  expandedId,
  onCreateSky,
  onUpdateSky,
  onDeleteSkies,
  onShareSky,
  onBrowseProviders,
  form,
  setForm,
  showAll,
  setShowAll,
}) {
  const carousel = useRef(null);
  const [sharing, setSharing] = useState(false); // the share sheet for the sky on screen
  const sky = skies[Math.min(index, skies.length - 1)];
  // Favorites gathers every hearted thought; any other sky holds the thoughts saved to it
  const shares = sharesOf(sky);
  const shared = shares.length > 0;
  const { who, many, count } = whoOf(shares);
  const sharedLabel = many ? `Shared with ${count} providers` : `Shared with ${who}`;
  const inSky = (s) => clouds.filter((c) => (s.system ? c.favorite : c.skyId === s.id));

  const sheet = form && (
    <SkyFormSheet
      sky={form === 'new' ? null : form}
      styleOnly={form !== 'new' && form?.system}
      onDelete={
        form !== 'new' && !form?.system
          ? () => {
              onDeleteSkies([form.id]);
              setForm(null);
            }
          : undefined
      }
      onClose={() => setForm(null)}
      onSave={(data) => {
        if (form === 'new') {
          onCreateSky(data);
          setIndex(skies.length); // the new sky is added last
          setShowAll(false);
        } else onUpdateSky(form.id, data);
        setForm(null);
      }}
    />
  );

  if (showAll) {
    return (
      <AllSkies
        skies={skies}
        clouds={clouds}
        inSky={inSky}
        onOpen={(k) => {
          setIndex(k);
          setShowAll(false);
        }}
        onEdit={setForm}
        onDelete={onDeleteSkies}
      >
        {sheet}
      </AllSkies>
    );
  }

  return (
    <>
      <SkyCarousel
        ref={carousel}
        loop
        label="My Sky"
        count={skies.length}
        index={Math.min(index, skies.length - 1)}
        onIndexChange={setIndex}
        renderPage={(k) => (
          <>
            <SkyBackground period={skies[k].style} />
            <CloudField
              view={skies[k].system ? 'fav' : 'mine'}
              onMoveCloud={onMoveCloud}
              expandedId={expandedId}
              clouds={inSky(skies[k])}
              metaOf={(c) => formatDate(c.timestamp)}
              empty={skies[k].system ? EMPTY_FAVORITES : undefined}
              cloudProps={cloudProps}
              newestFirst
            />
          </>
        )}
      />

      <div className={HEADER} style={{ '--fg-delay': '180ms' }}>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-h4 text-white">
            <Icon name={sky.icon} size={24} className="shrink-0" />
            <span className="truncate">{sky.name}</span>
          </h1>
          <p className="text-body1 text-turquoise-50 mt-2">{cloudCount(inSky(sky).length)}</p>
          {shared && (
            <button
              onClick={() => setSharing(true)}
              className="mt-2 inline-flex max-w-full items-center gap-1.5 min-h-8 rounded-ooca-pill bg-black/30 px-3 text-body4 text-white cursor-pointer"
            >
              <Icon name="share-bold" size={14} />
              {/* A long name gives way; "until …" always shows */}
              <span className="truncate">{sharedLabel}</span>
              {!many && <span className="shrink-0">· until {dayOf(shares[0])}</span>}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {/* Favorites gathers thoughts from every sky, so only the user's own skies are brought to a session */}
          {!sky.system && (
            <RoundButton
              size={40}
              label="Bring to my session"
              tip={shared ? sharedLabel : 'Bring to my session'}
              tipSide="left"
              pressed={shared}
              onClick={() => setSharing(true)}
              className={shared ? 'bg-turquoise-900 text-white' : 'bg-white text-turquoise-900'}
            >
              {/* Outline until shared, filled while it is */}
              <Icon name={shared ? 'share-bold' : 'share'} size={18} />
            </RoundButton>
          )}
          <RoundButton size={40} label={`Edit ${sky.name}`} tip="Edit this sky" tipSide="left" onClick={() => setForm(sky)}>
            <Icon name="edit-square" size={18} />
          </RoundButton>
        </div>
      </div>

      {/* Loops: after the last sky comes the first again */}
      <div className={ARROWS} style={{ '--fg-delay': '60ms' }}>
        <NavArrow dir="left" label="Previous sky" onClick={() => carousel.current?.step(-1)} hidden={skies.length < 2} />
        <NavArrow dir="right" label="Next sky" onClick={() => carousel.current?.step(1)} hidden={skies.length < 2} />
      </div>
      {sheet}
      {sharing && (
        <ShareSheet
          thoughts={inSky(sky)}
          sharedIds={shares.map((s) => s.id)}
          onShare={(ids) => {
            onShareSky(sky.id, ids);
            setSharing(false);
          }}
          onBrowse={(topics) => {
            onBrowseProviders(topics);
            setSharing(false);
          }}
          onClose={() => setSharing(false)}
        />
      )}
    </>
  );
}
