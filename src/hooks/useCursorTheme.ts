import { useEffect } from 'react';

const DARK_SECTION_SELECTORS = ['.marquee', '.identity', '.playlist'];

/**
 * Toggles `body.cursor-light` while mouse is over sections with dark backgrounds.
 * - Static dark sections: marquee, identity, playlist
 * - Dynamic: hs-wrap (cream → burgundy via scroll) — reads `data-dark` attribute
 *   set by HeroSignature's scroll handler.
 */
export function useCursorTheme(): void {
  useEffect(() => {
    const sources = new Set<string>();
    const refresh = () =>
      document.body.classList.toggle('cursor-light', sources.size > 0);

    type Unbind = () => void;
    const cleanups: Unbind[] = [];

    // -- static dark sections --
    DARK_SECTION_SELECTORS.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const key = `static-${i}`;
      const enter = () => {
        sources.add(key);
        refresh();
      };
      const leave = () => {
        sources.delete(key);
        refresh();
      };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    });

    // -- HeroSignature (dynamic bg) --
    const hsWrap = document.querySelector<HTMLElement>('.hs-wrap');
    if (hsWrap) {
      let mouseInside = false;
      const check = () => {
        const isDark = hsWrap.dataset.dark === 'true';
        if (mouseInside && isDark) sources.add('hs');
        else sources.delete('hs');
        refresh();
      };
      const enter = () => {
        mouseInside = true;
        check();
      };
      const leave = () => {
        mouseInside = false;
        check();
      };
      let ticking = false;
      const onScroll = () => {
        if (!mouseInside || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          check();
          ticking = false;
        });
      };
      hsWrap.addEventListener('mouseenter', enter);
      hsWrap.addEventListener('mouseleave', leave);
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => {
        hsWrap.removeEventListener('mouseenter', enter);
        hsWrap.removeEventListener('mouseleave', leave);
        window.removeEventListener('scroll', onScroll);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      document.body.classList.remove('cursor-light');
    };
  }, []);
}
