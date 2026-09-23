import React from 'react';
import ThoughtCloudItem from './ThoughtCloudItem';
import { Sparkles, Plus } from 'lucide-react';

export default function TimeSky({ clouds, onSelectCloud, onOpenRecorder }) {
  // Sort clouds chronologically
  const sortedClouds = [...clouds].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  return (
    <div className="flex-1 p-4 pb-28 overflow-y-auto">
      {/* Intro banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white/90">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <h2 className="text-sm font-bold tracking-tight">Time Sky — The Day's Flow</h2>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          Thoughts exist in moments of time. You don't need to analyze them—simply notice what was on your mind throughout your day.
        </p>
      </div>

      {sortedClouds.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center text-3xl">
            ☁️
          </div>
          <h3 className="text-white font-bold text-base mb-1">The Sky is Empty</h3>
          <p className="text-xs text-white/60 max-w-xs mx-auto mb-5">
            What's on your mind right now? Say it, hum it, or sigh it.
          </p>
          <button
            onClick={onOpenRecorder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-400 text-slate-900 font-bold text-xs shadow-lg hover:bg-teal-300 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add First Thought</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedClouds.map((cloud, idx) => (
            <ThoughtCloudItem
              key={cloud.id}
              cloud={cloud}
              index={idx}
              onClick={onSelectCloud}
            />
          ))}
        </div>
      )}
    </div>
  );
}
