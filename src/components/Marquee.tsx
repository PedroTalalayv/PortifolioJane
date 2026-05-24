import { useRef } from 'react';
import { useMarquee } from '../hooks/useMarquee';

const ITEMS = [
  'identidade visual',
  'social media',
  'direção criativa',
  'motion',
  'captação de vídeo',
  'branding',
];

export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  useMarquee(ref);

  const items = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track" ref={ref}>
        {items.map((label, i) => (
          <span key={`${label}-${i}`} style={{ display: 'contents' }}>
            <span>{label}</span>
            <span className="sparkle-glyph" />
          </span>
        ))}
      </div>
    </div>
  );
}
