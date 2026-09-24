import { useCallback, useSyncExternalStore } from 'react';

// true while the CSS media query matches (e.g. '(min-width: 1024px)'), and re-renders when that changes
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', onChange);
      return () => m.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
