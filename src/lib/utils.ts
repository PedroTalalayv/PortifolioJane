export const clamp = (v: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, v));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;
