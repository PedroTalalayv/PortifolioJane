import { useEffect, useRef, useState } from 'react';
import { SONGS } from '../data/songs';
import { clamp, lerp } from '../lib/utils';

export function Playlist() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollOffRef = useRef(0);
  const targetOffRef = useRef(0);
  const currentIdxRef = useRef(0);                    // espelho do state pros event handlers
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelInnerRef = useRef<HTMLDivElement>(null);
  const songElsRef = useRef<HTMLDivElement[]>([]);

  // mantém o ref em sync pra wheel/touch handlers
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);

  const song = SONGS[currentIdx];

  const layoutWheel = () => {
    const songEls = songElsRef.current;
    if (!songEls.length) return;
    const rowH = 70;
    const arcRadius = 220;
    const centerX = -10;
    // USA O REF, não o state — o rAF tick captura closure stale do currentIdx
    const curr = currentIdxRef.current;
    songEls.forEach((el, i) => {
      if (!el) return;
      const d = i - curr - scrollOffRef.current;
      const angle = d * 0.22;
      // curva invertida — as músicas distantes vão pra ESQUERDA (em direção ao disco)
      const x = centerX - arcRadius * (1 - Math.cos(angle));
      const y = d * rowH;
      const absD = Math.abs(d);
      const scale = clamp(1 - absD * 0.08, 0.5, 1);
      const opacity = clamp(1 - absD * 0.26, 0, 1);
      const blur = absD > 2 ? Math.min((absD - 2) * 0.8, 4) : 0;
      el.style.transform = `translate(${x}px, calc(-50% + ${y}px)) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.filter = blur ? `blur(${blur}px)` : 'none';
      el.style.zIndex = String(100 - Math.round(absD));
      el.classList.toggle(
        'is-active',
        i === curr && Math.abs(scrollOffRef.current) < 0.2,
      );
    });
  };

  useEffect(() => {
    layoutWheel();
    // re-layout on resize
    window.addEventListener('resize', layoutWheel);
    return () => window.removeEventListener('resize', layoutWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  // smooth ease scrollOff → targetOff
  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      scrollOffRef.current = lerp(scrollOffRef.current, targetOffRef.current, 0.18);
      layoutWheel();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // wheel + touch input on the stage
  useEffect(() => {
    const stage = stageRef.current;
    const playlistEl = document.getElementById('playlist');
    if (!stage || !playlistEl) return;

    // advance mexe nos refs (incluindo currentIdxRef pra sincronia imediata) e no state
    const advance = (dir: 1 | -1) => {
      const prev = currentIdxRef.current;
      const next = clamp(prev + dir, 0, SONGS.length - 1);
      if (next !== prev) {
        currentIdxRef.current = next;            // sync IMEDIATO pro layoutWheel
        targetOffRef.current -= dir;
        scrollOffRef.current -= dir;
        setCurrentIdx(next);                     // state pra re-render do now-playing
      } else {
        // bateu no limite — cap targetOff pra não acumular
        targetOffRef.current = clamp(targetOffRef.current, -0.5, 0.5);
      }
    };

    const isAtBoundary = (dir: 1 | -1) =>
      (dir === 1 && currentIdxRef.current >= SONGS.length - 1) ||
      (dir === -1 && currentIdxRef.current <= 0);

    const onWheel = (e: WheelEvent) => {
      const rect = playlistEl.getBoundingClientRect();
      const visible = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
      if (!visible) return;
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      if (isAtBoundary(dir)) return;
      e.preventDefault();
      targetOffRef.current += e.deltaY / 80;
      // while pra scrolls rápidos avançarem múltiplas músicas
      let safety = 20;
      while (targetOffRef.current > 0.55 && safety-- > 0) advance(1);
      while (targetOffRef.current < -0.55 && safety-- > 0) advance(-1);
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return;
      const dy = e.touches[0].clientY - touchY;
      const dir: 1 | -1 = dy < 0 ? 1 : -1;
      if (isAtBoundary(dir)) return;
      targetOffRef.current -= dy / 60;
      touchY = e.touches[0].clientY;
      let safety = 20;
      while (targetOffRef.current > 0.5 && safety-- > 0) advance(1);
      while (targetOffRef.current < -0.5 && safety-- > 0) advance(-1);
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const selectSong = (i: number) => {
    scrollOffRef.current = 0;
    targetOffRef.current = 0;
    setCurrentIdx((i + SONGS.length) % SONGS.length);
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  return (
    <section
      id="playlist"
      className="playlist"
      data-section="playlist"
      data-screen-label="06 Playlist"
    >
      <div className="sec-head">
        <h2 className="title">a playlist</h2>
        <p className="meta">
          o que toca
          <br />
          enquanto a<br />
          marca nasce
        </p>
      </div>

      <div className="playlist__stage" ref={stageRef}>
        {/* left: vinyl + wheel */}
        <div className="vinyl-stage">
          <div className={`vinyl${isPlaying ? '' : ' paused'}`}>
            <div className="vinyl__grooves" />
            <div className="vinyl__label">
              <div className="ttl">{song.ttl}</div>
              <div className="art">{song.art}</div>
            </div>
          </div>

          <div className={`tonearm${isPlaying ? ' playing' : ''}`}>
            <svg viewBox="0 0 200 320" aria-hidden="true">
              <circle cx="180" cy="20" r="14" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
              <circle cx="180" cy="20" r="6" fill="#444" />
              <rect x="170" y="22" width="20" height="240" rx="3" fill="#cfcfcf" />
              <rect x="160" y="248" width="40" height="32" rx="6" fill="#2a2a2a" />
              <rect x="170" y="278" width="20" height="14" fill="#1a1a1a" />
            </svg>
          </div>

          <div className="wheel">
            <div className="wheel__inner" ref={wheelInnerRef}>
              {SONGS.map((s, i) => (
                <div
                  key={i}
                  className="song"
                  data-idx={i}
                  ref={(el) => {
                    if (el) songElsRef.current[i] = el;
                  }}
                  onClick={() => selectSong(i)}
                >
                  <div className="song__cover">
                    <span className="gly">{s.glyph}</span>
                  </div>
                  <div className="song__txt">
                    <div className="song__ttl">{s.ttl}</div>
                    <div className="song__art">{s.art}</div>
                  </div>
                  <div className="song__dur">{s.dur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right: now-playing */}
        <div className="now">
          <div className="now__eyebrow">
            <span className="eq">
              <span />
              <span />
              <span />
              <span />
            </span>
            tocando agora
          </div>
          <div>
            <h2 className="now__title">{song.ttl.toUpperCase()}</h2>
            <div className="now__art">{song.art}</div>
          </div>
          <div className="now__alb">{song.alb}</div>

          <div className="now__bar">
            <span>01:14</span>
            <div className="fill" style={{ ['--p' as string]: '32%' }} />
            <span>{song.dur}</span>
          </div>

          <div className="now__controls">
            <button
              className="now__btn"
              aria-label="anterior"
              onClick={() => selectSong(currentIdx - 1)}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 4h2v16H6zM10 12L22 4v16z" />
              </svg>
            </button>
            <button
              className="now__btn now__btn--play"
              aria-label="play/pause"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 4 L20 12 L6 20 Z" />
                </svg>
              )}
            </button>
            <button
              className="now__btn"
              aria-label="próxima"
              onClick={() => selectSong(currentIdx + 1)}
            >
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 4h2v16h-2zM2 4l12 8-12 8z" />
              </svg>
            </button>
            <button className="now__btn" aria-label="shuffle">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M16 3l5 5-5 5v-3h-3l-2-2 2-2h3V3zm0 12l5 5-5 5v-3h-3l-2-2 2-2h3v-3zM3 5h5l9 12h4v2h-5L7 7H3V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
