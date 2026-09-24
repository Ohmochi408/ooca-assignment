// Five sky periods across the day. Gaps between the brief's ranges are folded into the nearest period.
// Night covers both ends of a calendar day (00:00–05:00 and 19:00–24:00), so every cloud belongs to
// exactly one (date, period) pair on the day it was recorded.
export const SKY_PERIODS = [
  { id: 'dawn', label: 'Dawn', range: '05:00–06:00', from: 5, to: 6 },
  { id: 'morning', label: 'Morning', range: '06:00–10:00', from: 6, to: 10 },
  { id: 'day', label: 'Midday', range: '10:00–16:00', from: 10, to: 16 },
  { id: 'sunset', label: 'Sunset', range: '16:00–19:00', from: 16, to: 19 },
  { id: 'night', label: 'Night', range: '19:00–05:00', from: 19, to: 29 },
];

export const periodById = (id) => SKY_PERIODS.find((p) => p.id === id) ?? SKY_PERIODS[0];
export const periodIndex = (id) => SKY_PERIODS.findIndex((p) => p.id === id);

export function getSkyPeriod(date = new Date()) {
  const hr = date.getHours() + date.getMinutes() / 60;
  const current = [...SKY_PERIODS].reverse().find((p) => hr >= p.from);
  return (current ?? SKY_PERIODS.at(-1)).id; // before 05:00 is still night
}

// 0…1 position of a moment inside its period (night wraps past midnight)
export function fractionInPeriod(date) {
  const p = periodById(getSkyPeriod(date));
  let hr = date.getHours() + date.getMinutes() / 60;
  if (p.id === 'night' && hr < 5) hr += 24;
  return Math.min(1, Math.max(0, (hr - p.from) / (p.to - p.from)));
}
