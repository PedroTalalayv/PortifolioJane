export type SectionId =
  | 'hero'
  | 'sobre'
  | 'social'
  | 'identidade'
  | 'motion'
  | 'playlist'
  | 'contato';

export interface NavItem {
  id: SectionId;
  label: string;
  number: string;
}

export interface Song {
  ttl: string;
  art: string;
  alb: string;
  dur: string;
  glyph: string;
}

export interface Project {
  number: string;
  title: string;
  tag: string;
  logo: string;
  size: 'lg' | 'md' | 'sm' | 'side';
  mockTone?: 'tonebrown' | 'toneblack' | 'tonepink' | 'tonegreen';
  delay?: number;
}
