// AI help after recording, from the person's own words (utils/useSpeechToText.js):
// a short name for the thought and, for voices of SUMMARY_FROM_SEC or more, up to three key points.
// Assistance, not interpretation — every point is a phrase they actually said (the fullest ones, in order).
// Nothing is added: no mood, no emotion, no diagnosis, no advice. When no words were caught there is simply no summary.
// A production version could hand the same words to a language model for a rewritten summary under the same rules.

export const SUMMARY_FROM_SEC = 5;
const NAME_CHARS = 28;
const POINT_CHARS = 80;
const MAX_POINTS = 3;

// Word pieces of a phrase — Thai has no spaces, so the browser's word segmenter finds the breaks
const wordsOf = (text, lang) =>
  typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)].map((s) => s.segment) : text.split(/(\s+)/);

// Shorten at a word break, never mid-word
function clip(text, lang, max) {
  if (text.length <= max) return text;
  let out = '';
  for (const w of wordsOf(text, lang)) {
    if ((out + w).trim().length > max) break;
    out += w;
  }
  return (out.trim() || text.slice(0, max)) + '…';
}

const tidy = (s) => s.replace(/\s+/g, ' ').trim();
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const wordCount = (text, lang) => wordsOf(text, lang).filter((w) => w.trim()).length;

// transcript = { phrases, status, lang } from useSpeechToText → { title, summary }
export function nameAndPoints(transcript, duration) {
  const lang = transcript?.lang ?? 'en-US';
  const phrases = (transcript?.phrases ?? []).map(tidy).filter(Boolean);
  if (!phrases.length) return { title: null, summary: null };

  const title = capitalise(clip(phrases[0], lang, NAME_CHARS));
  if (duration < SUMMARY_FROM_SEC) return { title, summary: null };

  // One short phrase is already its own name — a summary would only repeat it
  if (phrases.length === 1 && phrases[0].length <= NAME_CHARS) return { title, summary: null };

  const points = phrases
    .map((text, order) => ({ text, order, weight: wordCount(text, lang) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_POINTS)
    .sort((a, b) => a.order - b.order)
    .map((p) => capitalise(clip(p.text, lang, POINT_CHARS)));
  return { title, summary: points };
}

// Why there is no summary, in plain words (null when there is one, or the voice was too short to need one)
export function noSummaryReason(transcript, duration) {
  if (duration < SUMMARY_FROM_SEC) return null;
  switch (transcript?.status) {
    case 'unsupported':
      return 'No summary — this browser can’t turn speech into text. Try Chrome, Edge or Safari.';
    case 'failed':
      return 'No summary — speech-to-text wasn’t available (it needs the internet).';
    case 'nothing':
      return 'No summary — no words were caught this time.';
    default:
      return null;
  }
}
