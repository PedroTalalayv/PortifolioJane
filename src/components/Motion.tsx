import { useEffect, useRef, useState } from 'react';

interface VideoItem {
  src: string;
  eyebrow: string;
}

const BUCKET_BASE =
  'https://dfprzgakslkbfqptzthl.supabase.co/storage/v1/object/public/designJane';

const VIDEOS: VideoItem[] = [
  { src: `${BUCKET_BASE}/motion/comp-01.mp4`,               eyebrow: '★ comp 01 · 2025' },
  { src: `${BUCKET_BASE}/motion/comp-02.mp4`,               eyebrow: 'comp 02 · 2025' },
  { src: `${BUCKET_BASE}/motion/motion-logo.mp4`,           eyebrow: 'motion logo · 2025' },
  { src: `${BUCKET_BASE}/motion/vertical-01.mp4`,           eyebrow: 'vertical · stories' },
  { src: `${BUCKET_BASE}/motion/encanto-uva.mp4`,           eyebrow: 'encanto de uva · 2025' },
  { src: `${BUCKET_BASE}/motion/coelho.mp4`,                eyebrow: 'coelho · campanha' },
  { src: `${BUCKET_BASE}/motion/carnaval.mp4`,              eyebrow: 'carnaval · dia 15' },
  { src: `${BUCKET_BASE}/motion/delivery-carro.mp4`,        eyebrow: 'delivery · carro' },
  { src: `${BUCKET_BASE}/motion/delivery-morgana.mp4`,      eyebrow: 'delivery · morgana' },
  { src: `${BUCKET_BASE}/motion/retro.mp4`,                 eyebrow: 'retrô · dia 27' },
  { src: `${BUCKET_BASE}/motion/pre-lancamento-batata.mp4`, eyebrow: 'pré lançamento · batata' },
  { src: `${BUCKET_BASE}/motion/bastidores.mp4`,            eyebrow: 'bastidores' },
  { src: `${BUCKET_BASE}/motion/video-bastidores.mp4`,      eyebrow: 'bastidores · v2' },
  { src: `${BUCKET_BASE}/motion/vertical-02.mp4`,           eyebrow: 'vertical · v2' },
  { src: `${BUCKET_BASE}/motion/mvi-1750.mp4`,              eyebrow: 'mvi · 1750' },
  { src: `${BUCKET_BASE}/motion/mvi-2132.mp4`,              eyebrow: 'mvi · 2132' },
  { src: `${BUCKET_BASE}/motion/mvi-2478.mp4`,              eyebrow: 'mvi · 2478' },
];

function VideoTile({ src, eyebrow }: VideoItem) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  return (
    <div className="reel-item">
      <div
        className="reel-item__media"
        style={{ aspectRatio: dims ? `${dims.w} / ${dims.h}` : '9 / 16' }}
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
      <div className="reel-item__eyebrow">{eyebrow}</div>
    </div>
  );
}

export function Motion() {
  const stripRef = useRef<HTMLDivElement>(null);

  // wheel handler: dentro do strip, deltaY vira scrollLeft (sem afetar a página).
  // Fora do strip, scroll normal — passa direto pra próxima seção.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const onWheel = (e: WheelEvent) => {
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      const goingRight = e.deltaY > 0;
      const atEnd = goingRight ? strip.scrollLeft >= maxScroll - 1 : strip.scrollLeft <= 0;
      if (atEnd) return;
      e.preventDefault();
      strip.scrollLeft += e.deltaY * 2.5;
    };

    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => strip.removeEventListener('wheel', onWheel);
  }, []);

  // fade-in nos cards conforme entram na viewport (scroll horizontal ou vertical)
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !('IntersectionObserver' in window)) return;

    const items = strip.querySelectorAll<HTMLElement>('.reel-item');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px -5% 0px -5%' },
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="motion"
      className="motion"
      data-section="motion"
      data-screen-label="05 Motion"
    >
      <div className="motion__head">
        <h2 className="motion__title">motion &amp; vídeo</h2>
      </div>

      <div className="motion__strip" ref={stripRef}>
        {VIDEOS.map((v, i) => (
          <VideoTile key={i} {...v} />
        ))}
      </div>
    </section>
  );
}
