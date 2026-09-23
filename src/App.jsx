import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TimeSky from './components/TimeSky';
import MySkies from './components/MySkies';
import VoiceRecorderModal from './components/VoiceRecorderModal';
import CloudDetailModal from './components/CloudDetailModal';
import AboutModal from './components/AboutModal';
import { 
  getStoredClouds, 
  saveClouds, 
  getStoredSkies, 
  saveSkies 
} from './utils/storageHelper';

export default function App() {
  const [clouds, setClouds] = useState(getStoredClouds);
  const [skies, setSkies] = useState(getStoredSkies);
  const [currentMode, setCurrentMode] = useState('time'); // 'time' or 'skies'
  const [activeSkyId, setActiveSkyId] = useState('tonight');

  // Ambient time of day auto-detection & manual switcher
  const [timeOfDay, setTimeOfDay] = useState(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 11) return 'morning';
    if (hr >= 11 && hr < 16) return 'day';
    if (hr >= 16 && hr < 19) return 'sunset';
    return 'night';
  });

  // Modals state
  const [selectedCloud, setSelectedCloud] = useState(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveClouds(clouds);
  }, [clouds]);

  useEffect(() => {
    saveSkies(skies);
  }, [skies]);

  // Handlers
  const handleSaveNewCloud = (newCloud) => {
    setClouds((prev) => [newCloud, ...prev]);
  };

  const handleDeleteCloud = (id) => {
    setClouds((prev) => prev.filter((c) => c.id !== id));
    setSelectedCloud(null);
  };

  const handleMoveSky = (cloudId, newSkyId) => {
    const sky = skies.find((s) => s.id === newSkyId);
    setClouds((prev) =>
      prev.map((c) =>
        c.id === cloudId
          ? { ...c, skyId: newSkyId, skyName: sky ? sky.name : c.skyName }
          : c
      )
    );
    if (selectedCloud && selectedCloud.id === cloudId) {
      setSelectedCloud((prev) => ({
        ...prev,
        skyId: newSkyId,
        skyName: sky ? sky.name : prev.skyName,
      }));
    }
  };

  const handleAddSky = (newSky) => {
    setSkies((prev) => [...prev, newSky]);
  };

  // Background gradients according to time of day
  const skyBackgrounds = {
    morning: 'bg-gradient-to-b from-[#0e3b43] via-[#115e59] to-[#fbbf24]/30',
    day: 'bg-gradient-to-b from-[#0284c7] via-[#0ea5e9] to-[#7dd3fc]',
    sunset: 'bg-gradient-to-b from-[#3b0764] via-[#be185d] to-[#fb923c]',
    night: 'bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b]',
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 sm:p-4 transition-colors duration-1000 ${skyBackgrounds[timeOfDay]}`}>
      {/* Mobile-First Shell Container (Matches OOCA Smartphone App viewport) */}
      <main className="w-full sm:max-w-[420px] h-screen sm:h-[860px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border sm:border-white/20 bg-black/20 backdrop-blur-sm">
        {/* Top Header */}
        <Header
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          timeOfDay={timeOfDay}
          setTimeOfDay={setTimeOfDay}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenRecorder={() => setIsRecorderOpen(true)}
          cloudCount={clouds.length}
        />

        {/* Ambient Sky Viewport */}
        {currentMode === 'time' ? (
          <TimeSky
            clouds={clouds}
            onSelectCloud={setSelectedCloud}
            onOpenRecorder={() => setIsRecorderOpen(true)}
          />
        ) : (
          <MySkies
            clouds={clouds}
            skies={skies}
            activeSkyId={activeSkyId}
            setActiveSkyId={setActiveSkyId}
            onSelectCloud={setSelectedCloud}
            onOpenRecorder={() => setIsRecorderOpen(true)}
            onAddSky={handleAddSky}
          />
        )}

        {/* Floating Bottom Action Bar */}
        <footer className="absolute bottom-5 inset-x-4 flex items-center justify-center pointer-events-none">
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="pointer-events-auto flex items-center gap-2 py-3 px-6 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-900 font-extrabold text-sm shadow-xl shadow-teal-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-base">🎙️</span>
            <span>What's on your mind?</span>
          </button>
        </footer>

        {/* Modals */}
        {isRecorderOpen && (
          <VoiceRecorderModal
            skies={skies}
            onClose={() => setIsRecorderOpen(false)}
            onSaveCloud={handleSaveNewCloud}
          />
        )}

        {selectedCloud && (
          <CloudDetailModal
            cloud={selectedCloud}
            skies={skies}
            onClose={() => setSelectedCloud(null)}
            onDelete={handleDeleteCloud}
            onMoveSky={handleMoveSky}
          />
        )}

        {isAboutOpen && (
          <AboutModal onClose={() => setIsAboutOpen(false)} />
        )}
      </main>
    </div>
  );
}
