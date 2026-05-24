import { useEffect, useRef } from 'react';
import { clamp } from '../lib/utils';

export function Identity() {
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const rail = railRef.current;
      const track = trackRef.current;
      if (!rail || !track) return;
      const rect = rail.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rail.offsetHeight - vh;
      const p = clamp(-rect.top / Math.max(total, 1), 0, 1);
      const moveable = track.scrollWidth - window.innerWidth + 100;
      track.style.transform = `translateX(${-p * moveable}px)`;
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

  return (
    <section
      id="identidade"
      className="identity"
      data-section="identidade"
      data-screen-label="04 Mockups"
    >
      <div className="hp-wrap" ref={railRef}>
        <div className="hp-sticky">
          <div className="hp-sticky__head">
            <h2 className="title">mockups</h2>
          </div>

          <div className="hp-sticky__viewport">
            <div className="hp-track" ref={trackRef}>
              {/* col 1 — LOGO */}
              <div className="hp-col">
                <div className="hp-item hp-item--md">
                  <div className="hp-item__eyebrow">★ marca · 2025</div>
                  <div className="hp-item__media">
                    <img src="/uploads/mockups/logo.png" alt="Logo ADORA" />
                  </div>
                </div>
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* col 2 — callout + garrafas */}
              <div className="hp-callout">
                <div className="hp-callout__text">
                  <em>identidade</em>
                  <br />
                  que ganha forma
                </div>
                <div className="hp-callout__sig">Adora.</div>
              </div>

              <div className="hp-spacer" />

              <div className="hp-col">
                <div className="hp-item hp-item--md">
                  <div className="hp-item__eyebrow">embalagem · 2025</div>
                  <div className="hp-item__media">
                    <img src="/uploads/mockups/garrafas.png" alt="Garrafas com logo" />
                  </div>
                </div>
              </div>

              <div className="hp-spacer" />

              {/* col 3 — banner wide */}
              <div className="hp-col">
                <div className="hp-item hp-item--md">
                  <div className="hp-item__eyebrow">out-of-home · banner · 2025</div>
                  <div className="hp-item__media">
                    <img src="/uploads/mockups/banner.png" alt="Banner" />
                  </div>
                </div>
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* col 4 — crachá */}
              <div className="hp-col">
                <div className="hp-item hp-item--md">
                  <div className="hp-item__eyebrow">papelaria · crachá · 2025</div>
                  <div className="hp-item__media">
                    <img src="/uploads/mockups/cracha.png" alt="Crachá com logo" />
                  </div>
                </div>
              </div>

              <div className="hp-spacer" />

              {/* col 5 — callout final */}
              <div className="hp-callout">
                <div className="hp-callout__text">
                  da marca à <em>aplicação</em>.
                </div>
                <div className="hp-callout__sig">.adora</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
