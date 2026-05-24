import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib/utils';

interface VideoItem {
  src: string;
  eyebrow: string;
}

const VIDEOS: VideoItem[] = [
  { src: '/uploads/motion/comp-01.mp4',               eyebrow: '★ comp 01 · 2025' },
  { src: '/uploads/motion/comp-02.mp4',               eyebrow: 'comp 02 · 2025' },
  { src: '/uploads/motion/motion-logo.mp4',           eyebrow: 'motion logo · 2025' },
  { src: '/uploads/motion/vertical-01.mp4',           eyebrow: 'vertical · stories' },
  { src: '/uploads/motion/encanto-uva.mp4',           eyebrow: 'encanto de uva · 2025' },
  { src: '/uploads/motion/coelho.mp4',                eyebrow: 'coelho · campanha' },
  { src: '/uploads/motion/carnaval.mp4',              eyebrow: 'carnaval · dia 15' },
  { src: '/uploads/motion/delivery-carro.mp4',        eyebrow: 'delivery · carro' },
  { src: '/uploads/motion/delivery-morgana.mp4',      eyebrow: 'delivery · morgana' },
  { src: '/uploads/motion/retro.mp4',                 eyebrow: 'retrô · dia 27' },
  { src: '/uploads/motion/pre-lancamento-batata.mp4', eyebrow: 'pré lançamento · batata' },
  { src: '/uploads/motion/bastidores.mp4',            eyebrow: 'bastidores' },
  { src: '/uploads/motion/video-bastidores.mp4',      eyebrow: 'bastidores · v2' },
  { src: '/uploads/motion/vertical-02.mp4',           eyebrow: 'vertical · v2' },
  { src: '/uploads/motion/mvi-1750.mp4',              eyebrow: 'mvi · 1750' },
  { src: '/uploads/motion/mvi-2132.mp4',              eyebrow: 'mvi · 2132' },
  { src: '/uploads/motion/mvi-2478.mp4',              eyebrow: 'mvi · 2478' },
];

/** width responsivo baseado na orientação detectada do vídeo */
function widthFor(aspect: number | null): string {
  if (aspect === null) return 'clamp(380px, 32vw, 540px)';   // fallback enquanto carrega
  if (aspect > 1.3) return 'clamp(460px, 44vw, 760px)';      // landscape
  if (aspect < 0.8) return 'clamp(240px, 22vw, 360px)';      // portrait
  return 'clamp(340px, 30vw, 500px)';                        // square-ish
}

function VideoTile({ src, eyebrow }: VideoItem) {
  // dims = dimensões reais do vídeo lidas via onLoadedMetadata
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const aspect = dims ? dims.w / dims.h : null;

  return (
    <div className="hp-item motion-item">
      <div className="hp-item__eyebrow">{eyebrow}</div>
      <div
        className="hp-item__media motion-thumb"
        style={{
          width: widthFor(aspect),
          aspectRatio: dims ? `${dims.w} / ${dims.h}` : '16 / 10',
        }}
      >
        <video
          className="motion-video"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth && v.videoHeight) {
              setDims({ w: v.videoWidth, h: v.videoHeight });
            }
          }}
        />
      </div>
    </div>
  );
}

export function Motion() {
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
      id="motion"
      className="motion"
      data-section="motion"
      data-screen-label="05 Motion"
    >
      <div className="hp-wrap motion-hp-wrap" ref={railRef}>
        <div className="hp-sticky">
          <div className="hp-sticky__head">
            <h2 className="title">motion &amp; vídeo</h2>
          </div>

          <div className="hp-sticky__viewport">
            <div className="hp-track" ref={trackRef}>
              {/* col 1 — hero */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[0]} />
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* callout 1 */}
              <div className="hp-callout">
                <div className="hp-callout__text">
                  toda marca tem um <em>som</em>.
                </div>
                <div className="hp-callout__sig">deixa tocar.</div>
              </div>

              <div className="hp-spacer" />

              {/* col 2 — dois empilhados */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[1]} />
                <VideoTile {...VIDEOS[2]} />
              </div>

              <div className="hp-spacer" />

              {/* col 3 — vertical solo */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[3]} />
              </div>

              <div className="hp-spacer" />

              {/* col 4 — encanto uva */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[4]} />
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* col 5 — coelho + carnaval */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[5]} />
                <VideoTile {...VIDEOS[6]} />
              </div>

              <div className="hp-spacer" />

              {/* col 6 — delivery carro */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[7]} />
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* col 7 — delivery morgana + retro */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[8]} />
                <VideoTile {...VIDEOS[9]} />
              </div>

              <div className="hp-spacer" />

              {/* callout 2 */}
              <div className="hp-callout">
                <div className="hp-callout__text">
                  <em>captação</em>,
                  <br />
                  edição,
                  <br />
                  motion.
                </div>
                <div className="hp-callout__sig">tudo aqui.</div>
              </div>

              <div className="hp-spacer" />

              {/* col 8 — pré lançamento + bastidores v2 */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[10]} />
                <VideoTile {...VIDEOS[12]} />
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* col 9 — bastidores solo */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[11]} />
              </div>

              <div className="hp-spacer" />

              {/* col 10 — vertical v2 */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[13]} />
              </div>

              <div className="hp-spacer" />

              {/* col 11 — mvi 1750 */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[14]} />
              </div>

              <div className="hp-spacer hp-spacer--half" />

              {/* col 12 — mvi 2132 + 2478 */}
              <div className="hp-col">
                <VideoTile {...VIDEOS[15]} />
                <VideoTile {...VIDEOS[16]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
