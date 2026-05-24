import { useEffect } from 'react';

type ScrollFn = (y: number) => void;

export function useScrollListener(fn: ScrollFn): void {
  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    fn(window.scrollY);
    return () => window.removeEventListener('scroll', handler);
  }, [fn]);
}
