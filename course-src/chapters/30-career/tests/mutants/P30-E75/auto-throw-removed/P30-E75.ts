// P30-E75: לחלק שתי דקות בין החלקים
export function allocateSeconds(weights: Record<string, number>, total: number): Record<string, number> {
  const entries = Object.entries(weights);
  if (!Number.isInteger(total) || total < 0) throw new RangeError("total חייב להיות שלם אי־שלילי");

  const sum = entries.reduce((s, [, w]) => s + w, 0);
  if (sum === 0) throw new RangeError("סכום המשקלים 0");
  const exact = entries.map(([, w]) => (w * total) / sum);
  const base = exact.map(Math.floor);
  let left = total - base.reduce((s, x) => s + x, 0);
  const byRemainder = exact.map((x, i) => i).sort((a, b) => exact[b] - base[b] - (exact[a] - base[a]));
  for (const i of byRemainder) {
    if (left === 0) break;
    base[i]++;
    left--;
  }
  return Object.fromEntries(entries.map(([k], i) => [k, base[i]]));
}
