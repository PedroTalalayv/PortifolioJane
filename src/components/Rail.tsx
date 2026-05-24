import { NAV_ITEMS } from '../data/nav';
import type { SectionId } from '../types';

interface RailProps {
  active: SectionId;
}

export function Rail({ active }: RailProps) {
  return (
    <aside className="rail">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`rail__dot${active === item.id ? ' is-active' : ''}`}
          data-rail={item.id}
        >
          <span className="lbl">
            {item.number} {item.label.toLowerCase()}
          </span>
        </a>
      ))}
    </aside>
  );
}
