import { useEffect, useRef } from 'react';
import { clamp, lerp } from '../lib/utils';

// natural deceleration — pen slows at the end of the stroke
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const BG_WORDS = [
  'ADORA',
  'JANE OLIVEIRA',
  'DESIGN',
  'IDENTIDADE',
  'MOTION',
  'SOCIAL',
  'BRANDING',
  'GOIÂNIA',
  '2026',
];

// hex → [r, g, b]
const hexToRgb = (hex: number): [number, number, number] => [
  (hex >> 16) & 0xff,
  (hex >> 8) & 0xff,
  hex & 0xff,
];
const CREAM = hexToRgb(0xfff4e1);
const BURGUNDY = hexToRgb(0x560515);

const lerpColor = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(
    a[1] + (b[1] - a[1]) * t,
  )}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;

export function HeroSignature() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const janeWrapRef = useRef<HTMLDivElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);
  // smoothed Jane state — targets set by scroll, currents eased each rAF
  const janeTargetRef = useRef(0);
  const janeCurrentRef = useRef(0);
  const janeOpacityTargetRef = useRef(0);
  const janeOpacityCurrentRef = useRef(0);
  const bgRowARef = useRef<HTMLDivElement>(null);
  const bgRowBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let bgRaf = 0;
    let bgOffset = 0;
    let lastTick = performance.now();

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        const morph = morphRef.current;
        if (!wrap || !morph) {
          ticking = false;
          return;
        }

        const vh = window.innerHeight;
        const y = window.scrollY;
        const wrapTop = wrap.offsetTop;
        const total = wrap.offsetHeight - vh;
        const p = clamp((y - wrapTop) / Math.max(total, 1), 0, 1);

        // Background color: cream → burgundy over 0 → 0.40
        const bgP = clamp(p / 0.4, 0, 1);
        const bgColor = lerpColor(CREAM, BURGUNDY, bgP);
        wrap.style.backgroundColor = bgColor;
        // marca o wrap como dark assim que o bg passa da metade da transição
        wrap.dataset.dark = bgP > 0.5 ? 'true' : 'false';

        // Marquee bg: invisible at start, fades in alongside the burgundy bg
        const textColor = lerpColor(BURGUNDY, CREAM, bgP);
        if (bgWrapRef.current) {
          bgWrapRef.current.style.color = textColor;
          bgWrapRef.current.style.opacity = String(bgP);
        }

        // Morph: phase 1 (0 → 0.55) shrink + square; phase 2 (0.55 → 1) hold
        const morphP = clamp(p / 0.55, 0, 1);
        const startSize = Math.min(window.innerWidth * 0.7, 900);   /* fold 1 — como estava antes */
        const endSize = Math.min(window.innerWidth * 0.48, window.innerHeight * 0.7);  /* fold 2 — maior pra compensar formato retangular */
        const size = startSize + (endSize - startSize) * morphP;
        const startAspect = 0.49;     /* matches PDF natural aspect (1566/3196) */
        const endAspect = 0.55;       /* fecha um pouco no fold 2 mas mantém retangular */
        const aspect = startAspect + (endAspect - startAspect) * morphP;

        morph.style.width = `${size}px`;
        morph.style.height = `${size * aspect}px`;

        // "Studio" word — visible only on fold 1, fades out quickly as scroll begins.
        // Aligned with the left edge of the morph element (start of ADORA wordmark).
        const studioFadeOut = clamp(p / 0.12, 0, 1);
        const morphLeft = (window.innerWidth - size) / 2;
        const studioOffsetX = size * 0.7; /* posiciona Studio à direita (70% do morph) */
        if (studioRef.current) {
          studioRef.current.style.opacity = String(1 - studioFadeOut);
          studioRef.current.style.left = `${morphLeft + studioOffsetX}px`;
        }

        // Decorative stars — fade out as scroll begins (fold 1 only)
        const starsFadeOut = clamp(p / 0.18, 0, 1);
        if (starsRef.current) {
          starsRef.current.style.opacity = String(1 - starsFadeOut);
        }

        // Jane handwriting: scroll only sets TARGETS — rAF eases the currents.
        // Começa 2 "scrolls" antes (0.55 → 0.40).
        const drawPRaw = clamp((p - 0.4) / 0.4, 0, 1);
        janeTargetRef.current = easeOutCubic(drawPRaw);
        const janeIn = clamp((p - 0.4) / 0.05, 0, 1);
        janeOpacityTargetRef.current = janeIn;

        // Jane freeze: CSS sticky (parent) tracks viewport for free; once p > pinPoint
        // we apply an upward translateY equal to how far we've scrolled past pinPoint —
        // Jane stops following viewport and stays anchored to that page position.
        const pinPoint = 0.97;
        const freezeY = p > pinPoint ? (pinPoint - p) * total : 0;
        if (janeWrapRef.current) {
          janeWrapRef.current.style.setProperty('--freeze', `${freezeY}px`);
        }

        ticking = false;
      });
    };

    const tickBg = (now: number) => {
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      bgOffset -= 55 * dt;
      if (bgRowARef.current) {
        const w = bgRowARef.current.scrollWidth / 2;
        let off = bgOffset % w;
        if (off > 0) off -= w;
        bgRowARef.current.style.transform = `translateX(${off}px)`;
      }
      if (bgRowBRef.current) {
        const w = bgRowBRef.current.scrollWidth / 2;
        let off = -bgOffset % w;
        if (off < 0) off += w;
        bgRowBRef.current.style.transform = `translateX(${off - w}px)`;
      }

      // ease Jane reveal + opacity toward targets — gives inertia regardless of scroll speed
      janeCurrentRef.current = lerp(janeCurrentRef.current, janeTargetRef.current, 0.08);
      janeOpacityCurrentRef.current = lerp(
        janeOpacityCurrentRef.current,
        janeOpacityTargetRef.current,
        0.12,
      );
      if (janeWrapRef.current) {
        janeWrapRef.current.style.setProperty('--p', `${janeCurrentRef.current * 100}%`);
        janeWrapRef.current.style.opacity = String(janeOpacityCurrentRef.current);
      }
      // PDF fades out as Jane is drawn — fully invisible when Jane is 100%
      if (morphRef.current) {
        morphRef.current.style.opacity = String(clamp(1 - janeCurrentRef.current, 0, 1));
      }

      bgRaf = requestAnimationFrame(tickBg);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    bgRaf = requestAnimationFrame(tickBg);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(bgRaf);
    };
  }, []);

  const bgWordsRepeated = [...BG_WORDS, ...BG_WORDS, ...BG_WORDS, ...BG_WORDS];

  return (
    <div className="hs-wrap" ref={wrapRef} data-section="hero" data-screen-label="01 Hero + Recado">
      <div className="hs-sticky">
        {/* Background marquee placeholder */}
        <div className="hs-bg" aria-hidden="true" ref={bgWrapRef}>
          <div className="hs-bg__row hs-bg__row--a" ref={bgRowARef}>
            {bgWordsRepeated.map((w, i) => (
              <span key={`a-${i}`} className="hs-bg__word">
                {w}
                <span className="hs-bg__sep">★</span>
              </span>
            ))}
          </div>
          <div className="hs-bg__row hs-bg__row--b" ref={bgRowBRef}>
            {bgWordsRepeated.map((w, i) => (
              <span key={`b-${i}`} className="hs-bg__word">
                {w}
                <span className="hs-bg__sep">★</span>
              </span>
            ))}
          </div>
        </div>

        {/* Decorative floating stars (fold 1 only) */}
        <div className="hs-stars" aria-hidden="true" ref={starsRef}>
          <img className="hs-star hs-star--1" src="/assets/brand/sparkle8-burgundy.png" alt="" />
          <img className="hs-star hs-star--2" src="/assets/brand/star8-outline.png" alt="" />
          <img className="hs-star hs-star--3" src="/assets/brand/sparkle-burgundy.png" alt="" />
          <img className="hs-star hs-star--4" src="/assets/brand/sparkle-burgundy.png" alt="" />
          <img className="hs-star hs-star--5" src="/assets/brand/star8-outline.png" alt="" />
          <img className="hs-star hs-star--8" src="/assets/brand/sparkle8-burgundy.png" alt="" />
        </div>

        {/* "Studio" word — above the ADORA mark, fold 1 only */}
        <div className="hs-studio" ref={studioRef}>Studio.</div>

        {/* Morphing element — the ADORA mark that becomes a square */}
        <div className="hs-morph" ref={morphRef}>
          <img
            className="hs-morph__img"
            src="/uploads/prancheta-2-hd.png"
            alt="ADORA design"
            draggable={false}
          />
        </div>

        {/* Jane huge handwriting — INSIDE sticky: CSS centers it in viewport for free.
            After pinPoint, JS adds translateY to cancel sticky motion → page-anchored. */}
        <div className="hs-jane-wrap" ref={janeWrapRef} aria-hidden="true">
          <div className="hs-jane">Jane</div>

          {/* 3 linhas misturando caps + script + caps abaixo do Jane */}
          <div className="hs-jane-tagline-mix">
            <span className="caps">transformando</span>
            <span className="script">posicionamento</span>
            <span className="caps">em identidade</span>
          </div>
        </div>
      </div>
    </div>
  );
}
