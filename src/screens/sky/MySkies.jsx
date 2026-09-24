import React, { useRef } from 'react';
import Icon from '../../components/Icon';
import Mooca from '../../components/Mooca';
import RoundButton from '../../components/RoundButton';
import NavArrow from '../../components/NavArrow';
import SkyCarousel from '../../components/SkyCarousel';
import SkyBackground from '../../components/SkyBackground';
import CloudField from '../../components/CloudField';
import SkyFormSheet from '../../components/SkyFormSheet';
import { cloudCount } from '../../utils/format';
import { HEADER, ARROWS } from './layout';

const shortDate = (ms) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');

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
  form,
  setForm,
  showAll,
  setShowAll,
}) {
  const carousel = useRef(null);
  const sky = skies[Math.min(index, skies.length - 1)];
  // Favorites gathers every hearted thought; any other sky holds the thoughts saved to it
  const inSky = (s) => clouds.filter((c) => (s.system ? c.favorite : c.skyId === s.id));

  const sheet = form && (
    <SkyFormSheet
      sky={form === 'new' ? null : form}
      styleOnly={form !== 'new' && form?.system}
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
      <div className="absolute inset-0 bg-gray-100 overflow-y-auto pb-40">
        <div className="sticky top-0 z-10 bg-gray-100/90 backdrop-blur-sm px-4 pt-8 pb-3 short:pt-4">
          <div className="mx-auto max-w-[960px]">
            <h1 className="text-h4 text-black">All skies</h1>
            <p className="text-body1 text-bluegray-600 mt-2">
              {skies.filter((s) => !s.system).length} skies · {cloudCount(clouds.filter((c) => c.skyId).length)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 pb-6 mx-auto max-w-[992px]">
          {skies.map((s, k) => {
            const list = inSky(s);
            return (
              <button
                key={s.id}
                onClick={() => {
                  setIndex(k);
                  setShowAll(false);
                }}
                className="relative h-44 rounded-ooca-24 overflow-hidden text-left shadow-elevation-3 cursor-pointer group"
              >
                <div className={`sky-${s.style} absolute inset-0 transition-transform duration-300 group-hover:scale-105`} />
                <div className="absolute inset-x-0 top-5 flex justify-center -space-x-8 pointer-events-none" aria-hidden="true">
                  {list.slice(-2).map((c) => (
                    <Mooca key={c.id} id={c.mooca} width={78} />
                  ))}
                </div>
                <div className="absolute bottom-2 inset-x-2 flex items-center gap-1.5 bg-gray-100 rounded-ooca-16 pl-2 pr-2.5 py-1.5 text-black">
                  <Icon name={s.icon} size={16} className="shrink-0" />
                  <span className="text-body4 line-clamp-2 flex-1 min-w-0">{s.name}</span>
                  <span className="text-body5 text-bluegray-600">{list.length}</span>
                </div>
              </button>
            );
          })}
        </div>
        {sheet}
      </div>
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
              metaOf={(c) => shortDate(c.timestamp)}
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
        </div>
        <RoundButton size={40} label={`Edit ${sky.name}`} tip="Edit this sky" tipSide="left" onClick={() => setForm(sky)}>
          <Icon name="edit-square" size={18} />
        </RoundButton>
      </div>

      {/* Loops: after the last sky comes the first again */}
      <div className={ARROWS} style={{ '--fg-delay': '60ms' }}>
        <NavArrow dir="left" label="Previous sky" onClick={() => carousel.current?.step(-1)} hidden={skies.length < 2} />
        <NavArrow dir="right" label="Next sky" onClick={() => carousel.current?.step(1)} hidden={skies.length < 2} />
      </div>
      {sheet}
    </>
  );
}
