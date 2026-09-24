import React, { useState } from 'react';
import Icon from '../components/Icon';
import Wordmark from '../components/Wordmark';
import SkyFormSheet from '../components/SkyFormSheet';

export default function PlaceScreen({ clouds, skies, onChoose, onCreateSky }) {
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const selectedSky = skies.find((s) => s.id === selected);

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-8 bg-gray-100 overflow-y-auto">
      <Wordmark />

      <div className="flex flex-col gap-7 flex-1 justify-center w-full py-4">
        <div className="text-center">
          <h1 className="text-h3 text-bluegray-800">
            Where would you like
            <br />
            to keep this?
          </h1>
          <p className="text-body3 text-bluegray-500 mt-2">You decide what each space means.</p>
        </div>

        <div className="flex flex-col gap-3">
          {skies.map((sky) => {
            const count = clouds.filter((c) => c.skyId === sky.id).length;
            const isSelected = selected === sky.id;
            return (
              <button
                key={sky.id}
                onClick={() => setSelected(sky.id)}
                aria-pressed={isSelected}
                className={`w-full flex items-center gap-4 pl-3 pr-5 py-3 rounded-ooca-16 border-2 text-left transition-all duration-200 cursor-pointer ${
                  isSelected ? 'border-turquoise-500 bg-turquoise-50 shadow-elevation-3' : 'border-gray-300 bg-white hover:border-turquoise-300'
                }`}
              >
                <span className={`sky-${sky.style} w-12 h-12 rounded-ooca-8 flex items-center justify-center text-white shrink-0`}>
                  <Icon name={sky.icon} size={24} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-title3 text-bluegray-800 truncate">{sky.name}</p>
                  <p className="text-body5 text-bluegray-500 mt-0.5">
                    {count} thought{count !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className={isSelected ? 'text-turquoise-500' : 'text-gray-300'}>
                  <Icon name="check" size={24} />
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setCreating(true)}
            className="w-full flex items-center gap-4 pl-3 pr-5 py-3 rounded-ooca-16 border-2 border-dashed border-turquoise-300 text-turquoise-500 hover:border-turquoise-500 hover:bg-turquoise-50 transition-colors cursor-pointer"
          >
            <span className="w-12 h-12 rounded-ooca-8 bg-turquoise-50 flex items-center justify-center">
              <Icon name="add" size={24} />
            </span>
            <span className="text-title3">Create new sky</span>
          </button>
        </div>
      </div>

      <div className="w-full pt-2">
        <button onClick={() => selected && onChoose(selected)} disabled={!selected} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block">
          {selectedSky ? `Save to ${selectedSky.name}` : 'Choose a sky first'}
        </button>
      </div>

      {creating && (
        <SkyFormSheet
          onClose={() => setCreating(false)}
          onSave={(data) => {
            const sky = onCreateSky(data);
            setSelected(sky.id);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}
