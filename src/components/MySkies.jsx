import React, { useState } from 'react';
import ThoughtCloudItem from './ThoughtCloudItem';
import { Plus, Sparkles, FolderPlus } from 'lucide-react';

export default function MySkies({ 
  clouds, 
  skies, 
  activeSkyId, 
  setActiveSkyId, 
  onSelectCloud, 
  onOpenRecorder,
  onAddSky 
}) {
  const [isAddingSky, setIsAddingSky] = useState(false);
  const [newSkyName, setNewSkyName] = useState('');
  const [newSkyIcon, setNewSkyIcon] = useState('☁️');
  const [newSkyDesc, setNewSkyDesc] = useState('');

  const activeSky = skies.find((s) => s.id === activeSkyId) || skies[0];
  const filteredClouds = clouds.filter((c) => c.skyId === activeSkyId);

  const handleCreateSky = (e) => {
    e.preventDefault();
    if (!newSkyName.trim()) return;
    const newSky = {
      id: `custom-${Date.now()}`,
      name: newSkyName.trim(),
      icon: newSkyIcon || '☁️',
      description: newSkyDesc.trim() || 'A personal space defined by you.',
    };
    onAddSky(newSky);
    setActiveSkyId(newSky.id);
    setNewSkyName('');
    setNewSkyDesc('');
    setIsAddingSky(false);
  };

  return (
    <div className="flex-1 p-4 pb-28 overflow-y-auto">
      {/* Sky Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 mb-4">
        {skies.map((sky) => {
          const isActive = sky.id === activeSkyId;
          const count = clouds.filter((c) => c.skyId === sky.id).length;
          return (
            <button
              key={sky.id}
              onClick={() => setActiveSkyId(sky.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-white text-slate-900 border-white shadow-md'
                  : 'bg-black/30 hover:bg-black/40 text-white/80 border-white/10'
              }`}
            >
              <span>{sky.icon}</span>
              <span>{sky.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white/60'
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Add Custom Sky button */}
        <button
          onClick={() => setIsAddingSky(true)}
          className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 text-teal-300 border border-teal-400/30 text-xs font-medium whitespace-nowrap"
          title="Create a personal Sky"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Sky</span>
        </button>
      </div>

      {/* Active Sky Context Header */}
      <div className="mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{activeSky?.icon}</span>
          <h2 className="text-sm font-bold tracking-tight">{activeSky?.name}</h2>
        </div>
        <p className="text-xs text-white/70 leading-relaxed italic">
          "{activeSky?.description}"
        </p>
      </div>

      {/* Clouds in this Sky */}
      {filteredClouds.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center text-3xl">
            {activeSky?.icon || '☁️'}
          </div>
          <h3 className="text-white font-bold text-base mb-1">No thoughts here yet</h3>
          <p className="text-xs text-white/60 max-w-xs mx-auto mb-5">
            Leave a thought in {activeSky?.name} whenever you feel like it.
          </p>
          <button
            onClick={onOpenRecorder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-400 text-slate-900 font-bold text-xs shadow-lg hover:bg-teal-300 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add to this Sky</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredClouds.map((cloud, idx) => (
            <ThoughtCloudItem
              key={cloud.id}
              cloud={cloud}
              index={idx}
              onClick={onSelectCloud}
            />
          ))}
        </div>
      )}

      {/* Create Custom Sky Modal */}
      {isAddingSky && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-5 w-full max-w-sm text-white shadow-2xl animate-float-gentle">
            <h3 className="text-sm font-bold mb-1">Create a Personal Sky</h3>
            <p className="text-xs text-white/60 mb-4">
              "The system provides the space. You define the meaning."
            </p>

            <form onSubmit={handleCreateSky} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Sky Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Things I Want to Remember"
                  value={newSkyName}
                  onChange={(e) => setNewSkyName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Icon (Emoji)
                </label>
                <div className="flex gap-2">
                  {['🌱', '🌌', '🍵', '🕊️', '💡', '☁️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewSkyIcon(emoji)}
                      className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border ${
                        newSkyIcon === emoji
                          ? 'bg-teal-500 border-teal-300'
                          : 'bg-white/10 border-white/15'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  What does this space mean to you?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thoughts I want to revisit later."
                  value={newSkyDesc}
                  onChange={(e) => setNewSkyDesc(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSky(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white/70 text-xs font-semibold hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSkyName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-teal-400 text-slate-900 text-xs font-bold hover:bg-teal-300 disabled:opacity-40"
                >
                  Create Sky
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
