// Storage helper for Thought Clouds with persistence and pre-populated samples
const STORAGE_KEY = 'ooca_thought_clouds_v1';
const SKIES_KEY = 'ooca_user_skies_v1';

export const DEFAULT_SKIES = [
  { id: 'tonight', name: 'Tonight', icon: '🌙', description: 'Things I want to leave here tonight.' },
  { id: 'work', name: 'Work', icon: '💼', description: 'Things related to my work.' },
  { id: 'people', name: 'People', icon: '♡', description: 'Thoughts about people in my life.' },
  { id: 'unsaid', name: "Things I Can't Say", icon: '🌌', description: 'Thoughts kept safe without words.' },
];

export const INITIAL_CLOUDS = [
  {
    id: 'cloud-1',
    label: 'Morning commute & crowded train',
    time: '09:20 AM',
    timestamp: Date.now() - 14 * 60 * 60 * 1000,
    duration: 6,
    skyId: 'tonight',
    skyName: 'Tonight',
    audioUrl: null, // synthesized playback fallback
    frequency: [30, 45, 60, 40, 75, 50, 65, 40, 20],
  },
  {
    id: 'cloud-2',
    label: 'Call with Mom about weekend',
    time: '12:43 PM',
    timestamp: Date.now() - 11 * 60 * 60 * 1000,
    duration: 9,
    skyId: 'people',
    skyName: 'People',
    audioUrl: null,
    frequency: [25, 55, 80, 70, 85, 60, 45, 30, 15],
  },
  {
    id: 'cloud-3',
    label: "Tomorrow's presentation deck",
    time: '06:47 PM',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    duration: 14,
    skyId: 'work',
    skyName: 'Work',
    audioUrl: null,
    frequency: [40, 60, 90, 85, 95, 75, 50, 40, 30],
  },
  {
    id: 'cloud-4',
    label: 'Unnamed thought',
    time: '11:10 PM',
    timestamp: Date.now() - 30 * 60 * 1000,
    duration: 5,
    skyId: 'tonight',
    skyName: 'Tonight',
    audioUrl: null,
    frequency: [20, 35, 45, 50, 40, 30, 25, 15, 10],
  },
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
    return JSON.parse(raw);
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
