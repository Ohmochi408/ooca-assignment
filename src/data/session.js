// Booked ooca sessions (sample — the prototype has no booking). A sky can be shared with the providers of these
// sessions: each can listen to its thoughts — and new ones kept there — until their session ends, then it stops.
// Open the app with ?nosession to see a user with nothing booked.

// The next given weekday (0 = Sun), at the given hour
const next = (weekday, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7));
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};

const BOOKED = [
  { id: 'session-1', provider: 'Khun Fah', role: 'Clinical psychologist', channel: 'Video call', start: next(4, 19), minutes: 60 },
  { id: 'session-2', provider: 'Dr. Pimchanok Wongsawat', role: 'Adult psychiatrist', channel: 'Video call', start: next(6, 10), minutes: 30 },
];
const noSession = typeof location !== 'undefined' && new URLSearchParams(location.search).has('nosession');
export const SESSIONS = noSession ? [] : BOOKED;

const endOf = (s) => s.start + s.minutes * 60000;

// The sessions a sky is shared with right now (sharing ends with each session)
export const sharesOf = (sky) => {
  const ids = [].concat(sky?.sharedWith ?? []);
  return SESSIONS.filter((s) => ids.includes(s.id) && Date.now() < endOf(s));
};
export const isShared = (sky) => sharesOf(sky).length > 0;

// Who can listen, in words: the provider's name when it's one, a plain word when it's more
export const whoOf = (sessions) =>
  sessions.length === 1 ? { who: sessions[0].provider, many: false } : { who: 'Your providers', many: true, count: sessions.length };

const time = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
// "Thu, Oct 8 · 19:00–20:00"
export const whenOf = (s) =>
  `${new Date(s.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${time(s.start)}–${time(endOf(s))}`;
export const dayOf = (s) => new Date(s.start).toLocaleDateString('en-US', { weekday: 'short' });

// ooca's own topic tags (its provider list) — the user picks them; nothing is guessed from their voice
export const TOPICS = ['Stress', 'Anxiety', 'Depression', "Can't sleep", 'Work', 'Family', 'Love', 'Relationships', 'Bipolar'];
