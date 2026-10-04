import React, { useState } from 'react';
import Icon from '../../components/Icon';
import Mooca from '../../components/Mooca';
import { cloudCount } from '../../utils/format';

// My Sky → "All skies": every sky at a glance. Tap one to open it.
// Select: tick several, then Edit (exactly one — a name and an icon belong to one sky) or Delete (any number).
// Favorites is the system's sky: it can't be selected or deleted.
export default function AllSkies({ skies, clouds, inSky, onOpen, onEdit, onDelete, children }) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const own = skies.filter((s) => !s.system);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const stop = () => {
    setSelecting(false);
    setSelected([]);
  };

  return (
    <div className="absolute inset-0 bg-gray-100 overflow-y-auto pb-40">
      <div className="sticky top-0 z-10 bg-gray-100/90 backdrop-blur-sm px-4 pt-8 pb-3 short:pt-4">
        <div className="mx-auto max-w-[960px]">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-h4 text-black">{selecting ? 'Select skies' : 'All skies'}</h1>
            {own.length > 0 && (
              <button onClick={() => (selecting ? stop() : setSelecting(true))} className="ooca-btn ooca-btn-secondary ooca-btn-turquoise h-10 px-4">
                {selecting ? 'Cancel' : 'Select'}
              </button>
            )}
          </div>
          <p className="text-body1 text-bluegray-600 mt-2" aria-live="polite">
            {selecting
              ? selected.length
                ? `${selected.length} selected`
                : 'Tap the skies to select'
              : `${own.length} skies · ${cloudCount(clouds.filter((c) => c.skyId).length)}`}
          </p>
          {selecting && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => {
                  onEdit(own.find((s) => s.id === selected[0]));
                  stop();
                }}
                disabled={selected.length !== 1}
                className="ooca-btn ooca-btn-secondary ooca-btn-turquoise h-10 px-4"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(selected);
                  stop();
                }}
                disabled={!selected.length}
                className="ooca-btn ooca-btn-secondary ooca-btn-red h-10 px-4"
              >
                <Icon name="bin" size={16} />
                Delete{selected.length ? ` (${selected.length})` : ''}
              </button>
              {selected.length > 1 && <p className="text-body5 text-bluegray-600">Edit one at a time</p>}
            </div>
          )}
        </div>
      </div>

      {/* pt-2: room for the selected ring (drawn 4px outside the card) under the sticky header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 pt-2 pb-6 mx-auto max-w-[992px]">
        {skies.map((s, k) => {
          const list = inSky(s);
          const locked = selecting && s.system;
          const on = selected.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => (selecting ? !s.system && toggle(s.id) : onOpen(k))}
              aria-pressed={selecting && !s.system ? on : undefined}
              aria-disabled={locked || undefined}
              aria-label={selecting ? `${s.name}${s.system ? ' — can’t be deleted' : on ? ', selected' : ''}` : undefined}
              className={`relative h-44 rounded-ooca-24 overflow-hidden text-left shadow-elevation-3 group transition-opacity ${locked ? 'opacity-40 cursor-default' : 'cursor-pointer'} ${on ? 'ring-4 ring-turquoise-900' : ''}`}
            >
              <div className={`sky-${s.style} absolute inset-0 transition-transform duration-300 ${selecting ? '' : 'group-hover:scale-105'}`} />
              <div className="absolute inset-x-0 top-5 flex justify-center -space-x-8 pointer-events-none" aria-hidden="true">
                {list.slice(-2).map((c) => (
                  <Mooca key={c.id} id={c.mooca} width={78} />
                ))}
              </div>
              {selecting && !s.system && (
                <span
                  className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-elevation-2 ${on ? 'bg-turquoise-900 text-white' : 'bg-white/80 ring-2 ring-white'}`}
                  aria-hidden="true"
                >
                  {on && <Icon name="check" size={16} />}
                </span>
              )}
              <div className="absolute bottom-2 inset-x-2 flex items-center gap-1.5 bg-gray-100 rounded-ooca-16 pl-2 pr-2.5 py-1.5 text-black">
                <Icon name={s.icon} size={16} className="shrink-0" />
                <span className="text-body4 line-clamp-2 flex-1 min-w-0">{s.name}</span>
                <span className="text-body5 text-bluegray-600">{list.length}</span>
              </div>
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
