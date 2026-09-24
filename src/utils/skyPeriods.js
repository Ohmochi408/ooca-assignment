// Six equal sky periods of 4 hours. Dawn holds sunrise (~06:00 in Thailand), Sunset holds sundown (~18:00).
// Ids are stable (saved in My Skies styles): 'day' is shown as "Afternoon".
export const SKY_PERIODS = [
  { id: 'midnight', label: 'Midnight', range: '00:00–04:00', from: 0, to: 4 },
  { id: 'dawn', label: 'Dawn', range: '04:00–08:00', from: 4, to: 8 },
  { id: 'morning', label: 'Morning', range: '08:00–12:00', from: 8, to: 12 },
  { id: 'day', label: 'Afternoon', range: '12:00–16:00', from: 12, to: 16 },
  { id: 'sunset', label: 'Sunset', range: '16:00–20:00', from: 16, to: 20 },
  { id: 'night', label: 'Night', range: '20:00–24:00', from: 20, to: 24 },
];

export const periodById = (id) => SKY_PERIODS.find((p) => p.id === id) ?? SKY_PERIODS[0];
export const periodIndex = (id) => Math.max(0, SKY_PERIODS.findIndex((p) => p.id === id));

const hours = (date) => date.getHours() + date.getMinutes() / 60;

export function getSkyPeriod(date = new Date()) {
  const hr = hours(date);
  return (SKY_PERIODS.find((p) => hr >= p.from && hr < p.to) ?? SKY_PERIODS.at(-1)).id;
}

// 0…1 position of a moment inside its period
export function fractionInPeriod(date) {
  const p = periodById(getSkyPeriod(date));
  return Math.min(1, Math.max(0, (hours(date) - p.from) / (p.to - p.from)));
}
