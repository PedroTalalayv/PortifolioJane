import { useEffect } from 'react';

export function useReveal(): void {
  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    reveals.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.85) {
        el.classList.add('reveal--hide');
      } else {
        el.classList.add('in');
      }
    });

    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => {
        el.classList.remove('reveal--hide');
        el.classList.add('in');
      });
      return;
    }

    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove('reveal--hide');
            e.target.classList.add('in');
            ro.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    document.querySelectorAll<HTMLElement>('.reveal--hide').forEach((el) => ro.observe(el));

    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal--hide').forEach((el) => {
        el.classList.remove('reveal--hide');
        el.classList.add('in');
      });
    }, 6000);

    return () => {
      ro.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}
