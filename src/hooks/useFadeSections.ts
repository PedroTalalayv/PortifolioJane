import { useEffect } from 'react';
import { clamp } from '../lib/utils';

export function useFadeSections(): void {
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const fadeSecs = document.querySelectorAll<HTMLElement>('.fade-section');
      fadeSecs.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        const entry = clamp((vh - r.top) / (vh * 0.7), 0, 1);
        const exit = clamp(r.bottom / (vh * 0.5), 0, 1);
        const visible = Math.min(entry, exit);
        const tIn = (1 - entry) * 60;
        const tOut = (1 - exit) * -60;
        const scale = 0.97 + visible * 0.03;
        sec.style.opacity = String(visible);
        sec.style.transform = `translateY(${tIn + tOut}px) scale(${scale})`;
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);
}
