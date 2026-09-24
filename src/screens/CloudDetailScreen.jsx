import React from 'react';
import Icon from '../components/Icon';
import { CloudShape } from '../components/Cloud';
import PlayButton from '../components/PlayButton';
import ScreenHeader from '../components/ScreenHeader';
import { SkyBackdrop } from '../components/SkyBackground';
import useVoicePlayback from '../utils/useVoicePlayback';
import { formatDuration, formatTime } from '../utils/format';

const rise = (ms) => ({ '--rise-delay': `${ms}ms` });

// Opens over the same sky the cloud was tapped in (backdrop), so the cloud seems to come forward.
export default function CloudDetailScreen({ cloud, skies, backdrop, onBack, onMove, onDelete }) {
  const voice = useVoicePlayback(cloud.audioUrl, cloud.duration);
  const sky = skies.find((s) => s.id === cloud.skyId);

  return (
    <div className="relative h-full overflow-hidden">
      <SkyBackdrop period={backdrop} />
      <div className="relative h-full flex flex-col items-center justify-between px-6 py-8 overflow-y-auto">
        <div style={rise(0)} className="rise-in w-full">
          <ScreenHeader onBack={() => { voice.stop(); onBack(); }} backLabel="Sky" onSky />
        </div>

        <div className="flex flex-col items-center gap-7 flex-1 justify-center w-full">
          <div style={rise(60)} className="rise-in">
          <div className="relative cloud-float">
            <CloudShape width={240} shine />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-6">
              <PlayButton playing={voice.playing} onClick={voice.toggle} />
              <div className="w-24 h-1 rounded-full bg-turquoise-100 overflow-hidden">
                <div className="h-full bg-turquoise-500 transition-[width] duration-100" style={{ width: `${voice.progress * 100}%` }} />
              </div>
              <p className="text-body4 text-bluegray-600">{cloud.audioUrl ? formatDuration(cloud.duration) : `${formatDuration(cloud.duration)} · sample chime`}</p>
            </div>
          </div>
          </div>

          <div style={rise(120)} className="rise-in w-full bg-white rounded-ooca-24 p-6 shadow-elevation-4 flex flex-col gap-5">
            <div>
              <p className="text-body4 text-bluegray-600 uppercase mb-1">Label</p>
              <p className="text-title1 text-bluegray-800">{cloud.label}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-body4 text-bluegray-600 uppercase mb-1">Saved to</p>
                <p className="text-subheader1 text-bluegray-800 flex items-center gap-1 min-w-0">{sky && <Icon name={sky.icon} size={16} className="text-turquoise-500" />}<span className="truncate">{sky?.name ?? cloud.skyName}</span></p>
              </div>
              <div>
                <p className="text-body4 text-bluegray-600 uppercase mb-1">When</p>
                <p className="text-subheader1 text-bluegray-800">{formatTime(cloud.timestamp)}</p>
              </div>
              <div>
                <p className="text-body4 text-bluegray-600 uppercase mb-1">Duration</p>
                <p className="text-subheader1 text-bluegray-800">{formatDuration(cloud.duration)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex flex-col gap-4">
              <p className="text-body3 text-bluegray-600 italic">This is what you left here.</p>
              <div className="flex items-center justify-between gap-3">
                {/* Always reads "Move to…" — the current sky is shown above, not pre-selected here */}
                <select
                  value=""
                  onChange={(e) => e.target.value && onMove(cloud.id, e.target.value)}
                  aria-label="Move to another sky"
                  disabled={skies.length < 2}
                  className="min-w-0 flex-1 min-h-11 text-body4 text-bluegray-700 bg-gray-100 border border-gray-300 rounded-ooca-8 px-3 focus:border-turquoise-500 cursor-pointer"
                >
                  <option value="" disabled>Move to…</option>
                  {skies.filter((s) => s.id !== cloud.skyId).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button onClick={() => { voice.stop(); onDelete(cloud.id); }} className="ooca-btn ooca-btn-text ooca-btn-red gap-1 shrink-0 min-h-11 px-2 -mr-2">
                  <Icon name="bin" size={18} /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
