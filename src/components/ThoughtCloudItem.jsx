import React from 'react';
import { Volume2, Clock } from 'lucide-react';

export default function ThoughtCloudItem({ cloud, onClick, index = 0 }) {
  // Staggered floating delay for organic breeze feeling
  const delayClass = index % 3 === 0 ? 'animate-float-slow' : index % 2 === 0 ? 'animate-float-gentle' : 'animate-float-slow';

  return (
    <div
      onClick={() => onClick(cloud)}
      className={`group cursor-pointer transition-transform duration-300 active:scale-95 ${delayClass}`}
    >
      {/* Cloud Shape Container with Glassmorphism & Soft Drop Shadow */}
      <div className="relative bg-white/90 hover:bg-white text-slate-800 p-4 rounded-3xl shadow-lg hover:shadow-xl shadow-teal-900/10 border border-white/60 transition-all backdrop-blur-md">
        {/* Soft Cloud Bubbles background effect */}
        <div className="absolute -top-3 left-6 w-9 h-9 bg-white/90 rounded-full blur-[1px] -z-10 group-hover:scale-105 transition-transform" />
        <div className="absolute -top-4 right-8 w-11 h-11 bg-white/90 rounded-full blur-[1px] -z-10 group-hover:scale-105 transition-transform" />

        {/* Top metadata: Time & Sky pill */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-600" />
            <span>{cloud.time}</span>
          </div>
          {cloud.skyName && (
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-semibold border border-teal-200/60">
              {cloud.skyName}
            </span>
          )}
        </div>

        {/* Cloud Label (User defined or AI suggested) */}
        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-3">
          {cloud.label || 'Unnamed thought'}
        </h3>

        {/* Bottom Audio Bar & Duration */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-700">
              <Volume2 className="w-3 h-3" />
            </div>
            {/* Simulated mini waveform bars */}
            <div className="flex items-end gap-0.5 h-3">
              {(cloud.frequency || [30, 60, 45, 80, 50, 70, 30]).map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-teal-500/60 rounded-full group-hover:bg-teal-500 transition-colors"
                  style={{ height: `${Math.max(25, h)}%` }}
                />
              ))}
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            0:{cloud.duration < 10 ? `0${cloud.duration}` : cloud.duration}s
          </span>
        </div>
      </div>
    </div>
  );
}
