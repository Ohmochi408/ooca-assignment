import { DEFAULT_SKIES, INITIAL_CLOUDS, SAMPLE_SUMMARIES } from '../data/samples';

// localStorage for thoughts, skies and the Favorites look. Every read/write survives storage being unavailable.
// v2: Ideate2 "Main Design" — Mooca clouds, optional My Sky (skyId null = only in Time Sky)
const STORAGE_KEY = 'ooca_thought_clouds_v2';
const SKIES_KEY = 'ooca_user_skies_v2';

// Favorites: a sky the system makes — always first in My Sky, holds every hearted cloud (whatever sky it's in).
// Name and icon are fixed; the user can only change which of the six skies it looks like.
export const FAVORITES_ID = 'favorites';
const FAV_STYLE_KEY = 'ooca_favorites_style_v1';
export const favoritesSky = (style) => ({ id: FAVORITES_ID, name: 'Favorites', icon: 'favorite', style, system: true, description: 'Every thought you hearted.' });
export function getFavoritesStyle() {
  try {
    return localStorage.getItem(FAV_STYLE_KEY) || 'dawn';
  } catch {
    return 'dawn';
  }
}
export function saveFavoritesStyle(style) {
  try {
    localStorage.setItem(FAV_STYLE_KEY, style);
  } catch {
    // storage unavailable (private mode) — the choice just isn't kept
  }
}

// Icons a user can give their own sky (all from the OOCA DS)
export const SKY_ICON_CHOICES = ['star', 'favorite', 'moon', 'sunrise', 'home', 'music', 'chat', 'reward', 'magic', 'mood', 'user', 'lock'];

export function getStoredClouds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLOUDS));
      return INITIAL_CLOUDS;
    }
    // Samples saved before their summary existed get it
    return JSON.parse(raw).map((c) => (c.summary == null && SAMPLE_SUMMARIES[c.id] ? { ...c, summary: SAMPLE_SUMMARIES[c.id] } : c));
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
