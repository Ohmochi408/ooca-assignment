import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, X, Clock, MapPin, Volume2 } from 'lucide-react';
import { playSynthesizedHum } from '../utils/audioHelper';

export default function CloudDetailModal({ cloud, skies, onClose, onDelete, onMoveSky }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef(null);
  const stopAudioFnRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      if (stopAudioFnRef.current) stopAudioFnRef.current();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleTogglePlay = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (stopAudioFnRef.current) stopAudioFnRef.current();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsPlaying(false);
      setPlaybackProgress(0);
    } else {
      setIsPlaying(true);
      setPlaybackProgress(0);

      const duration = cloud.duration || 5;
      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setPlaybackProgress(progress);
        if (progress >= 100) {
          clearInterval(progressIntervalRef.current);
          setIsPlaying(false);
          setPlaybackProgress(0);
        }
      }, 100);

      if (cloud.audioUrl) {
        try {
          const audio = new Audio(cloud.audioUrl);
          audioRef.current = audio;
          audio.onended = () => {
            setIsPlaying(false);
            setPlaybackProgress(0);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          };
          await audio.play();
        } catch (err) {
          console.warn('Real audio playback blocked/failed, playing soothing chime:', err);
          const stopFn = await playSynthesizedHum(duration, () => {
            setIsPlaying(false);
            setPlaybackProgress(0);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          });
          stopAudioFnRef.current = stopFn;
        }
      } else {
        // Fallback for sample clouds: plays the gentle chime
        const stopFn = await playSynthesizedHum(duration, () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        });
        stopAudioFnRef.current = stopFn;
      }
    }
  };

  const currentSky = skies.find((s) => s.id === cloud.skyId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm text-white shadow-2xl relative overflow-hidden animate-float-gentle">
        {/* Header Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cloud Graphic & Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-14 mx-auto bg-white/95 rounded-full flex items-center justify-center shadow-xl text-3xl mb-3 border border-white/40">
            ☁️
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white mb-1">
            {cloud.label}
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-300" />
              {cloud.time}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              {currentSky ? `${currentSky.icon} ${currentSky.name}` : cloud.skyName}
            </span>
          </div>
        </div>

        {/* Audio Player Card */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/15 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold block text-white">
                  {isPlaying ? 'Playing Voice...' : 'Listen to Voice'}
                </span>
                <span className="text-[10px] text-white/60">
                  Duration: 0:{cloud.duration < 10 ? `0${cloud.duration}` : cloud.duration}s
                </span>
              </div>
            </div>
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-teal-300 animate-pulse' : 'text-white/40'}`} />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-400 h-full transition-all duration-100 rounded-full"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
        </div>

        {/* Philosophy closing reminder */}
        <div className="text-center p-3 rounded-2xl bg-black/30 border border-white/10 mb-6">
          <p className="text-xs font-medium text-teal-200">
            "This is what you left here."
          </p>
          <p className="text-[10px] text-white/50 mt-0.5">
            You don't have to carry it all in your head.
          </p>
        </div>

        {/* Move Sky dropdown / Delete action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <select
            value={cloud.skyId}
            onChange={(e) => onMoveSky(cloud.id, e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white/80 focus:outline-none focus:border-teal-400"
          >
            {skies.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                Move to {s.icon} {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onDelete(cloud.id)}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
