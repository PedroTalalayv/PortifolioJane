import { useEffect, useState } from 'react';

export function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // dispara o fade quando: (a) window terminou de carregar E (b) passou um tempo mínimo
    const MIN_MS = 1600;
    const startedAt = performance.now();

    const waitLoaded = () =>
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener('load', () => resolve(), { once: true });
          });

    waitLoaded().then(() => {
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(() => setHidden(true), wait);
    });
  }, []);

  return (
    <div className={`loader${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden}>
      <svg className="pl" viewBox="0 0 240 240" aria-label="carregando">
        <circle
          className="pl__ring pl__ring--a"
          cx="120" cy="120" r="105"
          fill="none" strokeWidth="20"
          strokeDasharray="0 660" strokeDashoffset="-330"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--b"
          cx="120" cy="120" r="35"
          fill="none" strokeWidth="20"
          strokeDasharray="0 220" strokeDashoffset="-110"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--c"
          cx="85" cy="120" r="70"
          fill="none" strokeWidth="20"
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
        <circle
          className="pl__ring pl__ring--d"
          cx="155" cy="120" r="70"
          fill="none" strokeWidth="20"
          strokeDasharray="0 440"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
