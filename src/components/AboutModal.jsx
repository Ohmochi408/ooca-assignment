import React from 'react';
import { X, ExternalLink, Sparkles, HeartHandshake, ShieldCheck, User } from 'lucide-react';

export default function AboutModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 w-full max-w-lg text-white shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-2xl">
            ☁️
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              OOCA — Thought Cloud
            </h2>
            <p className="text-xs text-teal-300 font-medium">
              UX/UI Product Designer (Design Engineer) Assignment
            </p>
          </div>
        </div>

        {/* Author / Candidate Badge */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-5 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-300" />
            <div>
              <span className="font-bold text-white">Wittawin Archanuparb (Ohm)</span>
              <span className="block text-[11px] text-white/50">Product Designer • TOEIC 970</span>
            </div>
          </div>
          <a
            href="https://github.com/Ohmochi408/ooca-assignment"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-teal-200 underline font-semibold"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Core Philosophy */}
        <div className="space-y-4 text-xs text-white/80 leading-relaxed mb-6">
          <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/20">
            <h4 className="font-bold text-teal-200 text-xs mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Design Principle</span>
            </h4>
            <p className="italic text-white/90">
              "Don't ask me to explain what's on my mind. Let me put it somewhere first."
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1.5">
              🎯 Why Voice over Typing?
            </h4>
            <p className="text-white/70">
              When people are stressed or overwhelmed, typing full coherent sentences creates immense cognitive friction. Voice allows people to hum, sigh, or speak in fragments without needing to make immediate sense.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1.5">
              🛡️ Ethical AI: Assistance, Not Interpretation
            </h4>
            <p className="text-white/70">
              AI suggests short labels (e.g. <em>"Tomorrow's presentation"</em>). It does <strong>NOT</strong> diagnose mental health, predict moods, or label someone as "anxious" or "depressed". The user decides what their thought means.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1.5">
              🌌 The Sky Concept
            </h4>
            <p className="text-white/70">
              <strong>Time Sky:</strong> Chronological flow connected to real-time ambient daylight.<br />
              <strong>My Skies:</strong> User-defined semantic spaces (🌙 Tonight, 💼 Work, ♡ People). <em>"The system provides the space; the user defines the meaning."</em>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold text-xs shadow-lg transition-transform active:scale-95"
        >
          Explore Thought Cloud
        </button>
      </div>
    </div>
  );
}
