// P30-E57: סדר הסעיפים
const ORDER = ["Summary", "Skills", "Projects", "Experience", "Education", "Languages"];
const REQUIRED = ["Summary", "Skills", "Projects", "Education"];

export function sectionCheck(md: string) {
  const names = (md.match(/^## .*$/gm) ?? []).map((l) => l.slice(3).trim());
  const lower = ORDER.map((s) => s.toLowerCase());
  const known: number[] = [];
  const unknown: string[] = [];
  for (const n of names) {
    const i = lower.indexOf(n.toLowerCase());
    if (i === -1) unknown.push(n);
    else known.push(i);
  }
  const missing = REQUIRED.filter((r) => !known.includes(ORDER.indexOf(r)));
  const outOfOrder = known.some((v, i) => i > 0 && v <= known[i - 1]);
  return { missing, outOfOrder, unknown };
}
