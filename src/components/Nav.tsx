import { useNavAutoHide } from '../hooks/useNavAutoHide';

export function Nav() {
  const hidden = useNavAutoHide();

  return (
    <nav className={`nav${hidden ? ' is-hidden' : ''}`} data-screen-label="Nav">
      <a href="#hero" className="nav__brand">
        ADORA
        <svg className="star" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 0 L11.6 8.4 L20 10 L11.6 11.6 L10 20 L8.4 11.6 L0 10 L8.4 8.4 Z"
          />
        </svg>
      </a>
    </nav>
  );
}
