// P29.5-E36: ההיסטוריה רק גדלה
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export function firstChangedMessage(prev: unknown[], next: unknown[]): number | null {
  for (let i = 0; i <= prev.length; i++) {
    if (i >= next.length || !same(prev[i], next[i])) return i;
  }
  return null;
}
