// Motion helpers shared by the screens (animations themselves live in index.css)
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// scrollTo / scrollBy behaviour that respects reduced motion
export const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

// Stagger for .rise-in elements
export const riseDelay = (ms) => ({ '--rise-delay': `${ms}ms` });
