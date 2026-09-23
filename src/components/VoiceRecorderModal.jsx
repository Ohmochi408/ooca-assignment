import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, ArrowRight, Check, X, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSynthesizedHum, blobToDataURL } from '../utils/audioHelper';

export default function VoiceRecorderModal({ skies, onClose, onSaveCloud }) {
  // Step state: 'record' -> 'label' -> 'choose_sky'
  const [step, setStep] = useState('record');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const [recordedFreqs, setRecordedFreqs] = useState([30, 50, 70, 85, 60, 45, 30]);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const stopAudioFnRef = useRef(null);

  // Label & Sky state
  const [suggestedLabel, setSuggestedLabel] = useState('');
  const [userLabel, setUserLabel] = useState('');
  const [selectedSkyId, setSelectedSkyId] = useState('tonight');

  // MediaRecorder refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // AI suggestions list (context-sensitive examples from brief)
  const SAMPLE_SUGGESTIONS = [
    "Tomorrow's presentation",
    "Feeling behind on tasks",
    "Call with Mom",
    "Weekend plans & downtime",
    "Late night thoughts",
    "Quiet moment between meetings"
  ];

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stopAudioFnRef.current) stopAudioFnRef.current();
    };
  }, []);

  // Timer loop
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            handleStopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  // Start real or simulated recording
  const handleStartRecording = async () => {
    setRecordingSeconds(0);
    audioChunksRef.current = [];
    setIsRecording(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            const dataUrl = await blobToDataURL(blob);
            setAudioBlobUrl(dataUrl);
          } catch (e) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlobUrl(URL.createObjectURL(blob));
          }
          try {
            stream.getTracks().forEach((track) => track.stop());
          } catch (e) {}
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone permission not granted or not supported; falling back to simulated input.', err);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    // Generate dynamic frequencies for visualizer
    const freqs = Array.from({ length: 9 }, () => Math.floor(Math.random() * 65) + 30);
    setRecordedFreqs(freqs);

    // AI suggestion simulation (pure label assistance, no diagnosis)
    const randomPick = SAMPLE_SUGGESTIONS[Math.floor(Math.random() * SAMPLE_SUGGESTIONS.length)];
    setSuggestedLabel(randomPick);
    setUserLabel(randomPick);

    // Transition to labeling step
    setTimeout(() => {
      setStep('label');
    }, 400);
  };

  // Playback preview
  const handleTogglePlay = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (stopAudioFnRef.current) stopAudioFnRef.current();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioBlobUrl) {
        try {
          const audio = new Audio(audioBlobUrl);
          audioRef.current = audio;
          audio.onended = () => setIsPlaying(false);
          await audio.play();
        } catch (err) {
          console.warn('Real audio preview failed, playing chime:', err);
          const stopFn = await playSynthesizedHum(recordingSeconds || 5, () => setIsPlaying(false));
          stopAudioFnRef.current = stopFn;
        }
      } else {
        const stopFn = await playSynthesizedHum(recordingSeconds || 5, () => setIsPlaying(false));
        stopAudioFnRef.current = stopFn;
      }
    }
  };

  // Save thought cloud
  const handleFinalSave = () => {
    const chosenSky = skies.find((s) => s.id === selectedSkyId) || skies[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newCloud = {
      id: `cloud-${Date.now()}`,
      label: userLabel.trim() || 'Unnamed thought',
      time: timeString,
      timestamp: Date.now(),
      duration: Math.max(2, recordingSeconds),
      skyId: chosenSky.id,
      skyName: chosenSky.name,
      audioUrl: audioBlobUrl,
      frequency: recordedFreqs,
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2dd4bf', '#38bdf8', '#fbbf24', '#ffffff']
      });
    } catch (e) {}

    onSaveCloud(newCloud);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md text-white shadow-2xl relative overflow-hidden transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: VOICE RECORDING */}
        {step === 'record' && (
          <div className="flex flex-col items-center text-center py-6">
            <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-4 border border-teal-400/30">
              Voice Externalization
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">
              What's on your mind?
            </h2>

            <p className="text-xs text-white/70 max-w-xs mb-8 leading-relaxed">
              Say it. Hum it. Sigh it.<br />
              <span className="text-teal-300 font-medium">It doesn't have to make sense.</span>
            </p>

            {/* Central Microphone / Pulse Button */}
            <div className="relative mb-6">
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping opacity-75" />
                  <div className="absolute -inset-4 rounded-full bg-teal-500/10 animate-pulse" />
                </>
              )}

              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 border-2 ${
                  isRecording
                    ? 'bg-rose-500 border-rose-300 text-white animate-pulse'
                    : 'bg-teal-400 hover:bg-teal-300 border-white text-slate-900 shadow-teal-500/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-8 h-8 fill-current mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Done</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Speak</span>
                  </>
                )}
              </button>
            </div>

            {/* Recording timer & Waveform */}
            {isRecording ? (
              <div className="space-y-2">
                <div className="text-sm font-bold text-teal-300 tracking-wider">
                  0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s
                </div>
                {/* Live pulsing audio wave bars */}
                <div className="flex items-center gap-1 h-6">
                  {[20, 60, 40, 90, 75, 40, 85, 30, 60, 45].map((val, i) => (
                    <div
                      key={i}
                      className="w-1 bg-teal-400 rounded-full transition-all duration-150 animate-pulse"
                      style={{
                        height: `${Math.max(20, (val * (1 + (recordingSeconds % 3) * 0.2)) % 100)}%`,
                        animationDelay: `${i * 80}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-white/50">
                Tap to start recording (up to 30 seconds)
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CLOUD CREATED & AI SUGGESTED LABEL */}
        {step === 'label' && (
          <div className="py-4">
            <div className="text-center mb-5">
              <div className="w-16 h-12 mx-auto bg-white/90 rounded-full flex items-center justify-center shadow-lg mb-2 animate-float-gentle text-slate-800">
                ☁️
              </div>
              <h3 className="text-base font-bold">Thought Cloud Created</h3>
              <p className="text-xs text-white/60">
                Duration: 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}s
              </p>
            </div>

            {/* Audio Preview playback */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/15 mb-5">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-teal-200"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Playing back...' : 'Listen to voice'}</span>
              </button>
              <div className="flex items-end gap-0.5 h-3">
                {recordedFreqs.map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-teal-400 rounded-full"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* AI Suggestion Box */}
            <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 mb-4">
              <div className="flex items-center gap-1.5 text-teal-300 text-[11px] font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Suggested Label (Assistance only)</span>
              </div>
              <p className="text-[11px] text-white/60 mb-2 leading-relaxed">
                AI suggests a label. You decide whether to use it, edit it, or leave it unnamed.
              </p>

              <input
                type="text"
                value={userLabel}
                onChange={(e) => setUserLabel(e.target.value)}
                placeholder="Name your thought (or leave unnamed)"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Leave unnamed quick button */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setUserLabel('Unnamed thought')}
                className="text-[11px] text-white/50 hover:text-white/80 underline"
              >
                Leave unnamed
              </button>
              <span className="text-[11px] text-white/40">You are in full control</span>
            </div>

            <button
              onClick={() => setStep('choose_sky')}
              className="w-full py-2.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <span>Next: Choose a Sky</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: CHOOSE A SKY */}
        {step === 'choose_sky' && (
          <div className="py-4">
            <div className="text-center mb-5">
              <h3 className="text-base font-bold mb-1">Where would you like to keep this?</h3>
              <p className="text-xs text-white/60">
                "The system provides the space. You define what it means."
              </p>
            </div>

            {/* Skies Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {skies.map((sky) => {
                const isSelected = selectedSkyId === sky.id;
                return (
                  <button
                    key={sky.id}
                    onClick={() => setSelectedSkyId(sky.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-400/20 border-teal-300 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xl mb-1">{sky.icon}</div>
                    <div className="text-xs font-bold text-white mb-0.5">{sky.name}</div>
                    <div className="text-[10px] text-white/50 line-clamp-1">{sky.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('label')}
                className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinalSave}
                className="flex-[2] py-2.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Place in Sky</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
