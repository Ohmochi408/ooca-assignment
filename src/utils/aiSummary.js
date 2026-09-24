// AI help after recording, from the person's own words (utils/useSpeechToText.js):
// a short name for the thought and, for voices of SUMMARY_FROM_SEC or more, up to three key points.
// Assistance, not interpretation — every point is a phrase they actually said. Nothing is added: no mood, no emotion,
// no diagnosis, no advice. When no words were caught there is simply no summary.
//
// Which phrases? The ones closest to what the person kept coming back to: meaningful words (fillers and small
// words left out) are counted across everything they said, and a phrase scores by how many of the repeated ones it
// holds. So a long ramble that gets to the point late is still named after the point, not after "um, so today…".
// It counts words; it doesn't understand them — the person can always tap another point to name the thought, or type.
// A production version could hand the same words to a language model for a rewritten summary under the same rules.

export const SUMMARY_FROM_SEC = 5;
const NAME_CHARS = 28;
const POINT_CHARS = 80;
const MAX_POINTS = 3;

// Fillers people start with — trimmed from the front of a phrase
const FILLERS = new Set([
  'เอ่อ',
  'อ่า',
  'อืม',
  'อ่ะ',
  'อะ',
  'คือ',
  'แบบ',
  'ก็',
  'แล้วก็',
  'ว่า',
  'นะ',
  'um',
  'uh',
  'erm',
  'so',
  'well',
  'like',
  'okay',
  'ok',
  'yeah',
  'and',
]);
// Small words that say little about the topic — not counted
const SMALL_WORDS = new Set([
  ...FILLERS,
  ...'ที่ และ ของ ใน มี เป็น ไป มา ได้ จะ ให้ กับ ครับ ค่ะ คะ จ้ะ น่ะ เลย ด้วย มัน เรา ผม ฉัน หนู เขา ยัง อยู่ แค่ ต้อง ไม่ ถ้า แต่ เพราะ ซึ่ง อัน นี้ นั้น ตอน นี่ ทำ แล้ว กัน ไหม มั้ย จริง ๆ อีก หรือ เนี่ย'.split(
    ' ',
  ),
  ...'the a an to of in on at for is are was were be been it this that i you we they he she my your our me with have has had do did just really very about there then than but or if not no'.split(
    ' ',
  ),
]);

// Thai script block, U+0E00–U+0E7F
const isThai = (text) => /[฀-๿]/.test(text);
const segmenter = (text) => (typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(isThai(text) ? 'th' : 'en', { granularity: 'word' }) : null);

// Word pieces of a phrase (Thai has no spaces — the browser's word segmenter finds the breaks)
const piecesOf = (text) => {
  const seg = segmenter(text);
  return seg ? [...seg.segment(text)].map((s) => ({ text: s.segment, word: s.isWordLike })) : text.split(/(\s+)/).map((t) => ({ text: t, word: /\S/.test(t) }));
};
const meaningfulWords = (text) =>
  piecesOf(text)
    .filter((p) => p.word)
    .map((p) => p.text.toLowerCase())
    .filter((w) => !SMALL_WORDS.has(w) && !/^\d+$/.test(w) && (isThai(w) || w.length > 1));

// Shorten at a word break, never mid-word
function clip(text, max) {
  if (text.length <= max) return text;
  let out = '';
  for (const p of piecesOf(text)) {
    if ((out + p.text).trim().length > max) break;
    out += p.text;
  }
  return (out.trim() || text.slice(0, max)) + '…';
}

const tidy = (s) => s.replace(/\s+/g, ' ').trim();
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Drop the words a phrase leads in with ("เอ่อ คือว่า…", "um so…"; for a name also "แต่ที่…", "but the…")
function trimFillers(text, words = FILLERS) {
  const pieces = piecesOf(text);
  let i = 0;
  while (i < pieces.length && (!pieces[i].text.trim() || words.has(pieces[i].text.toLowerCase()))) i++;
  return (
    pieces
      .slice(i)
      .map((p) => p.text)
      .join('')
      .trim() || text
  );
}

// A name for the thought made from one of its phrases
export const nameFrom = (phrase) => capitalise(clip(trimFillers(tidy(phrase), SMALL_WORDS), NAME_CHARS));

// Rank phrases by how much of what was said most they hold (ties: more meaningful words, then earlier)
function rank(phrases) {
  const words = phrases.map(meaningfulWords);
  const freq = new Map();
  for (const ws of words) for (const w of new Set(ws)) freq.set(w, (freq.get(w) ?? 0) + 1);
  return phrases
    .map((text, order) => {
      const unique = [...new Set(words[order])];
      return { text, order, score: unique.reduce((s, w) => s + (freq.get(w) - 1), 0), size: unique.length };
    })
    .sort((a, b) => b.score - a.score || b.size - a.size || a.order - b.order);
}

// transcript = { phrases, status, lang } from useSpeechToText → { title, summary }
export function nameAndPoints(transcript, duration) {
  const phrases = (transcript?.phrases ?? []).map(tidy).filter(Boolean);
  if (!phrases.length) return { title: null, summary: null };

  const ranked = rank(phrases);
  // The name: of the phrases that hold the most, the tightest one
  const best = ranked.filter((p) => p.score === ranked[0].score).sort((a, b) => a.size - b.size || a.order - b.order)[0];
  const title = nameFrom(best.text);
  if (duration < SUMMARY_FROM_SEC) return { title, summary: null };

  // One short phrase is already its own name — a summary would only repeat it
  if (phrases.length === 1 && phrases[0].length <= NAME_CHARS) return { title, summary: null };

  const summary = ranked
    .slice(0, MAX_POINTS)
    .sort((a, b) => a.order - b.order) // back in the order they were said
    .map((p) => capitalise(clip(trimFillers(p.text), POINT_CHARS)));
  return { title, summary };
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
