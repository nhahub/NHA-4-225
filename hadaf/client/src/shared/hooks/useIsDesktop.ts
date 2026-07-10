import { useEffect, useState } from 'react';

// Reactive viewport detection at Tailwind's `md` breakpoint (768px).
// Used by components that need to compute layouts inline (rather than via
// Tailwind responsive classes) — e.g. the Sidebar's slide-off transform,
// where `ltr:` / `rtl:` variants don't override `md:` due to Tailwind v4's
// `:where()` wrapper giving them 0 specificity.
const QUERY = '(min-width: 768px)';

export function useIsDesktop(): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return matches;
}