// Demo content: the skies and thoughts from the Figma design, so the prototype never opens empty.
// Loaded into localStorage on first visit (utils/storageHelper.js).

// icon = OOCA DS icon name (src/icons), style = which of the 6 time-of-day skies this space uses
export const DEFAULT_SKIES = [
  { id: '3am', name: '3AM Thoughts', icon: 'moon', style: 'midnight', description: 'Deep late-night thoughts, and old things that come back.' },
  { id: 'vent', name: 'Just wanna vent out!', icon: 'chat', style: 'sunset', description: 'Say it and let it go.' },
  { id: 'ideas', name: 'Quick ideas', icon: 'magic', style: 'morning', description: 'Little sparks worth keeping.' },
];

// Sample clouds — the ones shown in the Figma design (fixed dates), plus two from today so "now" isn't empty
const at = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h, mi).getTime();
const todayAt = (h, m) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d > Date.now()) d.setDate(d.getDate() - 1);
  return d.getTime();
};
const cloud = (id, label, timestamp, duration, skyId, mooca) => ({ id, label, timestamp, duration, skyId, mooca, favorite: false, audioUrl: null });

// AI summaries of the longer sample voices (see utils/aiSummary.js) — plain points of what was said, nothing read into it
export const SAMPLE_SUMMARIES = {
  'cloud-1': ['Pancakes and coffee on the balcony', 'No plans until the afternoon'],
  'cloud-2': ['Laundry before it rains', 'Milk, eggs and rice from the market'],
  'cloud-3': ['Saw Ploy’s photo from the reunion', 'Last talked two years ago', 'Maybe send a message this weekend'],
  'cloud-4': ['The talk before leaving for university', '“Take your time, it’s fine”', 'Still thinks of it before big choices'],
  'cloud-5': ['Office is on the 12th floor', 'Met the design team at lunch', 'Laptop setup tomorrow'],
  'cloud-6': ['Two comments on the onboarding flow', 'Deadline moved to Friday', 'Ask Jin about the icons'],
  'cloud-7': ['Rama 4 closed near the station', 'Home an hour late', 'Try the BTS tomorrow'],
};

export const INITIAL_CLOUDS = [
  cloud('cloud-1', 'Slow Sunday breakfast', at(2026, 9, 20, 9, 10), 8, null, 2),
  cloud('cloud-2', 'Laundry and grocery', at(2026, 9, 20, 11, 25), 8, null, 3),
  cloud('cloud-3', 'The friend I missed', at(2026, 9, 23, 2, 47), 21, '3am', 1),
  cloud('cloud-4', 'What Dad said back then', at(2026, 9, 12, 3, 12), 16, '3am', 3),
  cloud('cloud-5', 'First day of the new job', at(2026, 9, 1, 8, 15), 14, null, 5),
  cloud('cloud-6', 'Team feedback meeting', todayAt(10, 30), 18, 'vent', 4),
  cloud('cloud-7', 'Stuck in traffic again', todayAt(18, 20), 11, 'vent', 2),
].map((c) => ({ ...c, summary: SAMPLE_SUMMARIES[c.id] ?? null }));
