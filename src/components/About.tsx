export function About() {
  return (
    <section
      id="sobre"
      className="about fade-section"
      data-section="sobre"
      data-screen-label="02 Sobre"
    >
      <div className="about__inner">
        <div className="about__photo reveal">
          <img className="about__photo-img" src="/uploads/jane-photo.png" alt="Jane Oliveira" />
          <div className="grain" />
          <svg className="about__star" viewBox="0 0 100 100" aria-hidden="true">
            <path
              fill="var(--burgundy)"
              d="M50 0 L57 35 L92 30 L65 52 L93 78 L57 70 L50 100 L43 70 L7 78 L35 52 L8 30 L43 35 Z"
            />
          </svg>
        </div>

        <div className="about__copy">
          <div>
            <div className="about__hello reveal">oie</div>
            <h2 className="about__name reveal delay-1">
              eu sou a<br />jane.
            </h2>
          </div>
          <p className="about__bio reveal delay-2" style={{ opacity: 0.85 }}>
            Especializada em <b>design para redes sociais</b>, direção visual e
            conteúdo digital, atuando também com social media, audiovisual e
            desenvolvimento de landing pages.
          </p>

        </div>
      </div>
    </section>
  );
}
