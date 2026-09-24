export const formatDuration = (sec = 0) => `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, '0')}`;

export const formatTime = (ms) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatNow = (d = new Date()) =>
  `${d.toLocaleDateString([], { weekday: 'long' })} · ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
