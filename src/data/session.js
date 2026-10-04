// A booked ooca session (sample — the prototype has no booking). A sky can be shared with its provider:
// they see its thoughts — and new ones kept there — until the session ends. Sharing then stops by itself.

// Next Thursday, 19:00
const nextThursday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
  d.setHours(19, 0, 0, 0);
  return d.getTime();
};

export const SESSION = { id: 'session-1', provider: 'Khun Fah', role: 'Psychologist', channel: 'Video call', start: nextThursday(), minutes: 30 };
const end = SESSION.start + SESSION.minutes * 60000;

export const isShared = (sky) => sky?.sharedWith === SESSION.id && Date.now() < end;

const time = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
// "Thu, Oct 8 · 19:00–19:30"
export const sessionWhen = `${new Date(SESSION.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${time(SESSION.start)}–${time(end)}`;
export const sessionDay = new Date(SESSION.start).toLocaleDateString('en-US', { weekday: 'short' });
