import { useEffect, type RefObject } from 'react';
import { lerp } from '../lib/utils';

export function useMarquee(ref: RefObject<HTMLDivElement>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let mqOffset = 0;
    let lastTick = performance.now();
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let rafId = 0;

    const tick = (now: number) => {
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollVel = lerp(scrollVel, dy, 0.2);

      mqOffset -= (60 + Math.abs(scrollVel) * 15) * dt;
      const w = el.scrollWidth / 2;
      if (Math.abs(mqOffset) > w) mqOffset += w;
      el.style.animation = 'none';
      el.style.transform = `translateX(${mqOffset}px)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ref]);
}
