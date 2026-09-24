// Storage helper for Thought Clouds with persistence and pre-populated samples
const STORAGE_KEY = 'ooca_thought_clouds_v1';
const SKIES_KEY = 'ooca_user_skies_v1';

// icon = OOCA DS icon name (src/icons), style = which of the 5 time-of-day skies this space uses,
// color = OOCA color token for the sky's dot / accent
export const DEFAULT_SKIES = [
  { id: 'tonight', name: 'Tonight', icon: 'moon', style: 'night', color: 'blue-500', description: 'Things I want to leave here tonight.' },
  { id: 'work', name: 'Work', icon: 'folder', style: 'day', color: 'turquoise-500', description: 'Things related to my work.' },
  { id: 'people', name: 'People', icon: 'favorite', style: 'sunset', color: 'marigo-500', description: 'Thoughts about people in my life.' },
  { id: 'unsaid', name: "Things I Can't Say", icon: 'lock', style: 'dawn', color: 'flamingo-500', description: 'Thoughts kept safe without words.' },
];

// Icons a user can give their own sky (all from the OOCA DS)
export const SKY_ICON_CHOICES = ['star', 'favorite', 'moon', 'sunrise', 'home', 'music', 'chat', 'reward', 'magic', 'mood', 'user', 'lock'];

// Earlier versions stored emoji — map them onto DS icons (ds-allow: migration data only)
const EMOJI_ICONS = { '🌙': 'moon', '💼': 'folder', '♡': 'favorite', '🌌': 'lock', '🌱': 'star', '🍵': 'home', '🕊️': 'chat', '💡': 'magic', '☁️': 'star' };

function migrateSky(sky) {
  const preset = DEFAULT_SKIES.find((d) => d.id === sky.id);
  return {
    ...sky,
    icon: SKY_ICON_CHOICES.includes(sky.icon) || sky.icon === 'folder' ? sky.icon : EMOJI_ICONS[sky.icon] ?? preset?.icon ?? 'star',
    style: sky.style ?? preset?.style ?? 'morning',
  };
}

export const CUSTOM_SKY_COLORS = ['guava-500', 'sunshade-500', 'blue-300', 'turquoise-300', 'flamingo-300', 'marigo-300'];

export function skyColor(sky, index = 0) {
  return sky?.color ?? DEFAULT_SKIES.find((d) => d.id === sky?.id)?.color ?? CUSTOM_SKY_COLORS[index % CUSTOM_SKY_COLORS.length];
}

// Sample clouds spread over the last day, so every Time Sky period has something to look at
const hoursAgoAt = (h, m) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d > Date.now()) d.setDate(d.getDate() - 1);
  return d.getTime();
};

export const INITIAL_CLOUDS = [
  { id: 'cloud-1', label: "Couldn't sleep, early thoughts", timestamp: hoursAgoAt(5, 20), duration: 7, skyId: 'unsaid', skyName: "Things I Can't Say", audioUrl: null, frequency: [20, 35, 45, 50, 40, 30, 25, 15, 10] },
  { id: 'cloud-2', label: 'Morning commute & crowded train', timestamp: hoursAgoAt(8, 20), duration: 6, skyId: 'tonight', skyName: 'Tonight', audioUrl: null, frequency: [30, 45, 60, 40, 75, 50, 65, 40, 20] },
  { id: 'cloud-3', label: 'Call with Mom about weekend', timestamp: hoursAgoAt(12, 43), duration: 9, skyId: 'people', skyName: 'People', audioUrl: null, frequency: [25, 55, 80, 70, 85, 60, 45, 30, 15] },
  { id: 'cloud-4', label: "Tomorrow's presentation deck", timestamp: hoursAgoAt(17, 47), duration: 14, skyId: 'work', skyName: 'Work', audioUrl: null, frequency: [40, 60, 90, 85, 95, 75, 50, 40, 30] },
  { id: 'cloud-5', label: 'Unnamed thought', timestamp: hoursAgoAt(22, 10), duration: 5, skyId: 'tonight', skyName: 'Tonight', audioUrl: null, frequency: [20, 35, 45, 50, 40, 30, 25, 15, 10] },
];

export function getStoredClouds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLOUDS));
      return INITIAL_CLOUDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading clouds:', e);
    return INITIAL_CLOUDS;
  }
}

export function saveClouds(clouds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clouds));
  } catch (e) {
    console.error('Error saving clouds:', e);
  }
}

export function getStoredSkies() {
  try {
    const raw = localStorage.getItem(SKIES_KEY);
    if (!raw) {
      localStorage.setItem(SKIES_KEY, JSON.stringify(DEFAULT_SKIES));
      return DEFAULT_SKIES;
    }
    return JSON.parse(raw).map(migrateSky);
  } catch (e) {
    return DEFAULT_SKIES;
  }
}

export function saveSkies(skies) {
  try {
    localStorage.setItem(SKIES_KEY, JSON.stringify(skies));
  } catch (e) {
    console.error('Error saving skies:', e);
  }
}
