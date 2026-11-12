// P26.5-E38: איפה הסדר נשבר?
export function outOfOrderKeys(delivered: { key: string; seq: number }[]) {
  const max = new Map<string, number>();
  const bad = new Set<string>();
  for (const { key, seq } of delivered) {
    const m = max.get(key);
    if (m !== undefined && seq <= m) bad.add(key);
    else max.set(key, seq);
  }
  return [...bad].sort();
}
