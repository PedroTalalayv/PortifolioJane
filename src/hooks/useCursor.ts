import { useEffect, type RefObject } from 'react';
import { lerp } from '../lib/utils';

export function useCursorFollow(ref: RefObject<HTMLDivElement>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia('(hover: hover)').matches) return;

    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      cx = lerp(cx, tx, 0.28);
      cy = lerp(cy, ty, 0.28);
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [ref]);
}
