import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib/utils';

interface FrameItem {
  title: string;
  date: string;
  bg: string;
  color: string;
  glyph?: string;
  tilt?: boolean;
  img?: string;       // se presente, renderiza imagem em vez do glyph
}

interface StoryItem {
  bg: string;
  color: string;
  glyph?: string;
  img?: string;       // se presente, imagem cobre o card
}

const BUCKET_BASE =
  'https://dfprzgakslkbfqptzthl.supabase.co/storage/v1/object/public/designJane';

const FEED_ITEMS: FrameItem[] = [
  { title: 'Post @adora.studio', date: '04 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: '/uploads/feed-01.png' },
  { title: 'Post @adora.studio', date: '04 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: '/uploads/feed-02.png' },
  { title: 'Post @adora.studio', date: '03 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: '/uploads/feed-03.jpg' },
  { title: 'Expoauto v2',        date: '04 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: `${BUCKET_BASE}/feed/expoautoo-v2.png` },
  { title: 'Post @adora.studio', date: '02 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: '/uploads/feed-04.jpg' },
  { title: 'Post @adora.studio', date: '01 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: '/uploads/feed-05.png' },
  { title: 'Post @adora.studio', date: '04 · 2025', bg: 'transparent', color: 'var(--burgundy)', img: '/uploads/feed-06.png' },
];

// Stories — 7 cards no formato leque (symmetric fan), todos com imagens reais
const STORIES_ITEMS: StoryItem[] = [
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-05.png' },
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-01.png' },
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-02.png' },
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-03.png' },
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-04.jpg' },
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-06.png' },
  { bg: 'var(--burgundy)', color: 'var(--cream)', img: '/uploads/story-07.png' },
];

// posições simétricas do fan (do Lando)
const FAN_LAYOUT: { x: string; y: string; rotate: number; scale: number; z: number }[] = [
  { x: '-30rem', y: '7.3rem', rotate: -21, scale: 0.78, z: 1 },
  { x: '-22rem', y: '4rem',   rotate: -14, scale: 0.85, z: 2 },
  { x: '-11rem', y: '1.3rem', rotate: -7,  scale: 0.93, z: 3 },
  { x: '0rem',   y: '0rem',   rotate: 0,   scale: 1,    z: 10 },
  { x: '11rem',  y: '1.3rem', rotate: 7,   scale: 0.93, z: 3 },
  { x: '22rem',  y: '4rem',   rotate: 14,  scale: 0.85, z: 2 },
  { x: '30rem',  y: '7.3rem', rotate: 21,  scale: 0.78, z: 1 },
];

export function Social() {
  const fanRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isFanned, setIsFanned] = useState(false);

  // dispara o fan-out quando a área dos stories entra no viewport
  useEffect(() => {
    const el = fanRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setIsFanned(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsFanned(true);
          io.disconnect();
        }
      },
      { rootMargin: '-15% 0px -15% 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // scroll horizontal pinado pro feed: rail (alto) + sticky (viewport) com track transladado em X
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
      id="social"
      className="social fade-section"
      data-section="social"
      data-screen-label="03 Social"
    >
      <div className="sec-head">
        <h2 className="title">social media</h2>
      </div>

      {/* === A — FEED (horizontal scroll pinado) =========================== */}
      <div className="feed-rail" ref={railRef}>
        <div className="feed-sticky">
          <div className="feed-sticky__head">
            <h3 className="social__sub-title">feed</h3>
          </div>
          <div className="feed-sticky__viewport">
            <div className="feed-track" ref={trackRef}>
              {FEED_ITEMS.map((item, i) => (
                <FrameCard key={i} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === STORIES (leque) ============================================== */}
      <div className="social__sub">
        <div className="social__sub-head">
          <h3 className="social__sub-title">stories</h3>
        </div>
        <div
          className={`stories-fan${isFanned ? ' is-fanned' : ''}`}
          ref={fanRef}
        >
          <div className="stories-fan__inner">
            {STORIES_ITEMS.map((item, i) => {
              const pos = FAN_LAYOUT[i];
              // distância do centro pra escalar o delay (centro vai primeiro)
              const distFromCenter = Math.abs(i - 3);
              return (
                <div
                  key={i}
                  className="story-card"
                  style={
                    {
                      // CSS custom props: o transform real é composto via CSS
                      '--fan-tx': pos.x,
                      '--fan-ty': pos.y,
                      '--fan-rot': `${pos.rotate}deg`,
                      '--fan-scale': pos.scale,
                      '--fan-delay': `${distFromCenter * 0.18}s`,
                      zIndex: pos.z,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="story-card__bg"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.img ? (
                      <img className="story-card__img" src={item.img} alt="" />
                    ) : (
                      item.glyph && (
                        <span className="story-card__glyph">{item.glyph}</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FrameCard({ item }: { item: FrameItem }) {
  return (
    <article className="frame-card reveal">
      <div className="frame-card__wrap">
        <div
          className="frame-card__media"
          style={{ background: item.bg, color: item.color }}
        >
          {item.img ? (
            <img className="frame-card__img" src={item.img} alt={item.title} />
          ) : (
            item.glyph && (
              <span className={`frame-card__glyph${item.tilt ? ' is-tilt' : ''}`}>
                {item.glyph}
              </span>
            )
          )}
        </div>
      </div>
      <div className="frame-card__label">
        <h3 className="frame-card__title">{item.title}</h3>
        <span className="frame-card__date">{item.date}</span>
      </div>
    </article>
  );
}
