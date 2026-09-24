// AI help after recording: a short name for every voice and, for longer ones, a few plain points of what was said.
// Assistance, not interpretation — only the topics the person spoke about, in plain words. Never a mood, an emotion,
// a diagnosis or advice.
// Prototype: a stand-in for a real speech-to-text + summary call. It answers after a short wait with a sample.

// Voices shorter than this are already short — a summary would only repeat them, so they only get a name
export const SUMMARY_FROM_SEC = 5;

const SAMPLES = [
  {
    title: 'Tomorrow’s presentation',
    points: ['Slides are done, the demo part isn’t yet', 'Wants one more run-through tonight', 'Asks Mai to check the numbers'],
  },
  { title: 'Moving to the new flat', points: ['Lease starts on the 1st', 'Boxes, internet and the cat’s vet move', 'Deciding what to sell first'] },
  { title: 'Weekend with the family', points: ['Visiting grandma on Saturday', 'Picking a gift on the way', 'Sunday is kept free'] },
  { title: 'Saving for a laptop', points: ['Current one is five years old', 'Setting aside a bit each payday', 'Looking again in December'] },
  { title: 'Learning to cook', points: ['Tried the curry from the video', 'Too salty — less fish sauce next time', 'Next: an omelette for breakfast'] },
  { title: 'Trip home for the holiday', points: ['Train tickets open next Monday', 'Staying three nights', 'Bringing snacks for the nephews'] },
];

export function suggestFor(rec) {
  const pick = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
  return new Promise((resolve) => setTimeout(() => resolve({ title: pick.title, summary: rec.duration >= SUMMARY_FROM_SEC ? pick.points : null }), 1600));
}
