// Counts always read "N thought(s)" — one fixed wording, so no singular/plural logic to get wrong.
// (On screen the object is a *thought*; a cloud is just how it looks.)
export const cloudCount = (n) => `${n} thought(s)`;

export const formatDuration = (sec = 0) => `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, '0')}`;
