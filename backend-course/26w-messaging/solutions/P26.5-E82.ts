// P26.5-E82: חלוקת partitions בין consumers
export function assignPartitions(partitions: number, consumers: string[]): Record<string, number[]> {
  if (new Set(consumers).size !== consumers.length) throw new Error("שמות כפולים");
  const sorted = [...consumers].sort();
  const n = sorted.length;
  const out: Record<string, number[]> = {};
  if (n === 0) return out;
  const base = Math.floor(partitions / n);
  const extra = partitions % n;
  let next = 0;
  sorted.forEach((c, i) => {
    const count = base + (i < extra ? 1 : 0);
    out[c] = Array.from({ length: count }, (_, k) => next + k);
    next += count;
  });
  return out;
}
