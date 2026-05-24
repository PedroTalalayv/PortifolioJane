import { useEffect, useState } from 'react';
import type { SectionId } from '../types';

export function useActiveSection(ids: SectionId[]): SectionId {
  const [active, setActive] = useState<SectionId>(ids[0]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const elements = ids
      .map((id) => document.querySelector<HTMLElement>(`[data-section="${id}"]`))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        const target = visible[0]?.target as HTMLElement | undefined;
        const id = target?.dataset.section as SectionId | undefined;
        if (id) setActive(id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );

    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}
