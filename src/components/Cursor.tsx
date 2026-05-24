import { useRef } from 'react';
import { useCursorFollow } from '../hooks/useCursor';

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useCursorFollow(ref);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <svg className="cursor__star" viewBox="0 0 32 32">
        <path
          fill="var(--burgundy)"
          d="M16 2 L19.7 12.4 L30.8 12.4 L21.8 19 L25.2 29.4 L16 23 L6.8 29.4 L10.2 19 L1.2 12.4 L12.3 12.4 Z"
        />
      </svg>
    </div>
  );
}
