import { useRef, useState } from 'react';

// The browser's own speech-to-text (Web Speech API: Chrome, Edge, Safari), running alongside the voice recording.
// It keeps the finished phrases — one per pause — so the ready screen can name the thought and pick its key points
// from what the person actually said. Nothing is made up: if the browser can't listen, the screen says so.
// Note: browsers send the audio to their own speech service (Google / Apple) to turn it into text.
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
export const speechSupported = Boolean(Recognition);

export const SPEECH_LANGS = [
  { id: 'th-TH', label: 'ไทย' },
  { id: 'en-US', label: 'EN' },
];
const LANG_KEY = 'ooca_speech_lang_v1';
function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (SPEECH_LANGS.some((l) => l.id === saved)) return saved;
  } catch {
    // storage unavailable — use the default
  }
  // Thai first: ooca is a Thai service, and people often speak Thai on a browser set to English. EN is one tap away.
  return 'th-TH';
}

export default function useSpeechToText() {
  const [lang, setLangState] = useState(initialLang);
  const langRef = useRef(lang);
  const phrases = useRef([]);
  const current = useRef(null); // the running recognizer
  const listening = useRef(false); // the user wants words (the browser ends a session on long pauses — restart it)
  const failed = useRef(false);
  const ended = useRef(null); // resolves stop() once the last phrase is in
  const stopping = useRef(null);

  const begin = () => {
    const r = new Recognition();
    r.lang = langRef.current;
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i].isFinal && e.results[i][0].transcript.trim();
        if (text) phrases.current.push(text);
      }
    };
    r.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return; // silence, or our own stop
      failed.current = true;
      listening.current = false;
    };
    r.onend = () => {
      if (listening.current && current.current === r) return begin();
      if (current.current === r) current.current = null;
      ended.current?.();
    };
    current.current = r;
    try {
      r.start();
    } catch {
      failed.current = true;
      listening.current = false;
    }
  };

  const start = () => {
    if (!speechSupported || listening.current) return;
    phrases.current = [];
    failed.current = false;
    stopping.current = null;
    listening.current = true;
    begin();
  };

  // Stop and hand over what was heard: { phrases, status: 'heard' | 'nothing' | 'failed' | 'unsupported', lang }
  const stop = () => {
    if (stopping.current) return stopping.current;
    listening.current = false;
    stopping.current = new Promise((resolve) => {
      const finish = () => {
        ended.current = null;
        const result = !speechSupported ? 'unsupported' : phrases.current.length ? 'heard' : failed.current ? 'failed' : 'nothing';
        resolve({ phrases: [...phrases.current], status: result, lang: langRef.current });
      };
      if (!current.current) return finish();
      ended.current = finish;
      current.current.stop();
      setTimeout(finish, 2500); // the last phrase usually lands well before this
    });
    return stopping.current;
  };

  // Leave without keeping anything
  const abort = () => {
    listening.current = false;
    ended.current = null;
    current.current?.abort();
    current.current = null;
  };

  // Switch language — also mid-recording (the words so far are kept)
  const setLang = (id) => {
    langRef.current = id;
    setLangState(id);
    try {
      localStorage.setItem(LANG_KEY, id);
    } catch {
      // not kept — fine
    }
    if (listening.current && current.current) current.current.stop(); // onend restarts it in the new language
  };

  return { lang, setLang, start, stop, abort };
}
