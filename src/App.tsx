import { useReveal } from './hooks/useReveal';
import { useFadeSections } from './hooks/useFadeSections';
import { useCursorTheme } from './hooks/useCursorTheme';
import { Loader } from './components/Loader';
import { Cursor } from './components/Cursor';
import { Nav } from './components/Nav';
import { HeroSignature } from './components/HeroSignature';
import { About } from './components/About';
import { Marquee } from './components/Marquee';
import { Social } from './components/Social';
import { Identity } from './components/Identity';
import { Motion } from './components/Motion';
import { Playlist } from './components/Playlist';
import { Footer } from './components/Footer';

function App() {
  useReveal();
  useFadeSections();
  useCursorTheme();

  return (
    <>
      <Loader />
      <Cursor />
      <Nav />
      <HeroSignature />
      <About />
      <Marquee />
      <Social />
      <Identity />
      <Motion />
      <Playlist />
      <Footer />
    </>
  );
}

export default App;
