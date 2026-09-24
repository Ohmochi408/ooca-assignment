import React, { useState } from 'react';
import Icon from '../components/Icon';
import ScreenHeader from '../components/ScreenHeader';
import { SkyBackdrop } from '../components/SkyBackground';
import SkyFormSheet from '../components/SkyFormSheet';

const rise = (ms) => ({ '--rise-delay': `${ms}ms` });

export default function PlaceScreen({ clouds, skies, sky: backdrop, onBack, onChoose, onCreateSky }) {
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const selectedSky = skies.find((s) => s.id === selected);

  return (
    <div className="relative h-full overflow-hidden">
      <SkyBackdrop period={backdrop} />
      <div className="relative h-full flex flex-col items-center justify-between px-6 py-8 overflow-y-auto">
        <div style={rise(0)} className="rise-in w-full">
          <ScreenHeader onBack={onBack} onSky />
        </div>

        <div className="flex flex-col gap-7 flex-1 justify-center w-full py-4">
          <div style={rise(60)} className="rise-in text-center">
            <h1 className="text-h3 text-white">
              Where would you like
              <br />
              to keep this?
            </h1>
            <p className="text-body3 text-white/85 mt-2">You decide what each space means.</p>
          </div>

          <div style={rise(120)} className="rise-in flex flex-col gap-3">
            {skies.map((sky) => {
              const count = clouds.filter((c) => c.skyId === sky.id).length;
              const isSelected = selected === sky.id;
              return (
                <button
                  key={sky.id}
                  onClick={() => setSelected(sky.id)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center gap-4 pl-3 pr-5 py-3 rounded-ooca-16 border-2 text-left transition-all duration-200 cursor-pointer ${
                    isSelected ? 'border-turquoise-500 bg-turquoise-50 shadow-elevation-4' : 'border-white bg-white hover:border-turquoise-300'
                  }`}
                >
                  <span className={`sky-${sky.style} w-12 h-12 rounded-ooca-8 flex items-center justify-center text-white shrink-0`}>
                    <Icon name={sky.icon} size={24} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-title3 text-bluegray-800 truncate">{sky.name}</p>
                    <p className="text-body5 text-bluegray-600 mt-0.5">
                      {count} thought{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Empty ring until chosen — a grey tick read as "already selected" */}
                  <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-turquoise-500 border-turquoise-500 text-white' : 'border-bluegray-200'}`} aria-hidden="true">
                    {isSelected && <Icon name="check" size={18} />}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-4 pl-3 pr-5 py-3 rounded-ooca-16 border-2 border-dashed border-white/80 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors cursor-pointer"
            >
              <span className="w-12 h-12 rounded-ooca-8 bg-white/20 flex items-center justify-center">
                <Icon name="add" size={24} />
              </span>
              <span className="text-title3">Create new sky</span>
            </button>
          </div>
        </div>

        <div style={rise(180)} className="rise-in w-full pt-2">
          <button onClick={() => selected && onChoose(selected)} disabled={!selected} className="ooca-btn ooca-btn-primary ooca-btn-turquoise ooca-btn-block shadow-elevation-4">
            {selectedSky ? `Save to ${selectedSky.name}` : 'Choose a sky first'}
          </button>
        </div>
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
