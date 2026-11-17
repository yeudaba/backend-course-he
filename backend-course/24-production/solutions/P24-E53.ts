// P24-E53: ימי עבודה עד היעד
const toDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)); // "תאריך" = חצות UTC; ב־UTC אין שעון קיץ
};
const toStr = (d: Date) => d.toISOString().slice(0, 10);

export function addBusinessDays(from: string, n: number, weekend: number[] = [5, 6]): string {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`n לא תקין: ${n}`);
  const d = toDate(from);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!weekend.includes(d.getUTCDay())) left--;
  }
  return toStr(d);
}

export function businessDaysBetween(from: string, to: string, weekend: number[] = [5, 6]): number {
  const d = toDate(from);
  const end = toDate(to);
  let count = 0;
  while (d < end) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!weekend.includes(d.getUTCDay())) count++;
  }
  return count;
}

console.log(addBusinessDays("2026-11-05", 3), businessDaysBetween("2026-11-05", "2026-11-10"));
console.log(addBusinessDays("2026-03-26", 1), addBusinessDays("2026-11-06", 0), addBusinessDays("2026-11-05", 1, [0, 6]));
