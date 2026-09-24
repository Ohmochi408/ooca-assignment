import React from 'react';
import Icon from '../components/Icon';
import { CloudShape } from '../components/Cloud';
import PlayButton from '../components/PlayButton';
import Wordmark from '../components/Wordmark';
import useVoicePlayback from '../utils/useVoicePlayback';
import { formatDuration, formatTime } from '../utils/format';

export default function CloudDetailScreen({ cloud, skies, onBack, onMove, onDelete }) {
  const voice = useVoicePlayback(cloud.audioUrl, cloud.duration);
  const sky = skies.find((s) => s.id === cloud.skyId);

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-8 bg-gray-100 overflow-y-auto">
      <div className="w-full flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-subheader2 text-bluegray-400 hover:text-bluegray-600 cursor-pointer">
          <Icon name="arrow-left" size={18} /> Sky
        </button>
        <Wordmark />
        <span className="w-16" />
      </div>

      <div className="flex flex-col items-center gap-7 flex-1 justify-center w-full">
        <div className="relative cloud-float">
          <CloudShape width={240} fill="var(--color-turquoise-50)" shine />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pb-6">
            <PlayButton playing={voice.playing} onClick={voice.toggle} />
            <div className="w-24 h-1 rounded-full bg-turquoise-100 overflow-hidden">
              <div className="h-full bg-turquoise-500 transition-[width] duration-100" style={{ width: `${voice.progress * 100}%` }} />
            </div>
            <p className="text-body4 text-bluegray-500">{cloud.audioUrl ? formatDuration(cloud.duration) : `${formatDuration(cloud.duration)} · sample chime`}</p>
          </div>
        </div>

        <div className="w-full bg-white rounded-ooca-24 p-6 shadow-elevation-2 flex flex-col gap-5">
          <div>
            <p className="text-body4 text-bluegray-400 uppercase mb-1">Label</p>
            <p className="text-title1 text-bluegray-800">{cloud.label}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-body4 text-bluegray-400 uppercase mb-1">Saved to</p>
              <p className="text-subheader1 text-bluegray-800 flex items-center gap-1 min-w-0">{sky && <Icon name={sky.icon} size={16} className="text-turquoise-500" />}<span className="truncate">{sky?.name ?? cloud.skyName}</span></p>
            </div>
            <div>
              <p className="text-body4 text-bluegray-400 uppercase mb-1">When</p>
              <p className="text-subheader1 text-bluegray-800">{formatTime(cloud.timestamp)}</p>
            </div>
            <div>
              <p className="text-body4 text-bluegray-400 uppercase mb-1">Duration</p>
              <p className="text-subheader1 text-bluegray-800">{formatDuration(cloud.duration)}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex flex-col gap-4">
            <p className="text-body3 text-bluegray-400 italic">This is what you left here.</p>
            <div className="flex items-center justify-between gap-3">
              <select
                value={cloud.skyId}
                onChange={(e) => onMove(cloud.id, e.target.value)}
                aria-label="Move to another sky"
                className="min-w-0 flex-1 text-body4 text-bluegray-700 bg-gray-100 border border-gray-300 rounded-ooca-8 px-3 py-2 outline-none focus:border-turquoise-500"
              >
                {skies.map((s) => (
                  <option key={s.id} value={s.id}>Move to {s.name}</option>
                ))}
              </select>
              <button onClick={() => onDelete(cloud.id)} className="ooca-btn ooca-btn-text ooca-btn-red gap-1 shrink-0">
                <Icon name="bin" size={18} /> Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
