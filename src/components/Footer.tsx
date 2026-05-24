const ArrowGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const LINKS = [
  { href: 'mailto:oi@adora.design', label: 'oi@adora.design', external: false },
  { href: '#', label: '@adora.studio', external: true },
  { href: '#', label: 'behance / jane', external: true },
  { href: 'https://wa.me/', label: 'whatsapp →', external: true },
];

export function Footer() {
  return (
    <footer
      id="contato"
      className="foot fade-section"
      data-section="contato"
      data-screen-label="07 Contato"
    >
      <div>
        <div className="foot__hi">vamos</div>
        <div className="foot__big">
          criar
          <br />
          algo
          <br />
          juntos?
        </div>
      </div>

      <div className="foot__row">
        <div className="foot__links">
          {LINKS.map((l, i) => (
            <a
              key={i}
              className="foot__link"
              href={l.href}
              {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}
            >
              <span className="line" />
              {l.label}
              <span className="arr">
                <ArrowGlyph />
              </span>
            </a>
          ))}
        </div>

        <div className="foot__meta">
          <div>Goiânia / GO</div>
          <div style={{ marginTop: 8, color: 'var(--burgundy)' }}>
            ★ aberto p/ novos projetos
          </div>
        </div>
      </div>

      <div className="foot__bottom">
        <div>© 2026 adora design · jane oliveira</div>
      </div>

      <div className="foot__credit">
        site por{' '}
        <a
          href="https://wa.me/5562982262779"
          target="_blank"
          rel="noopener"
          className="foot__credit-name"
        >
          Pedro Talalayv
        </a>
        {' · '}
        <a href="tel:+5562982262779" className="foot__credit-phone">
          (62) 98226-2779
        </a>
      </div>
    </footer>
  );
}
