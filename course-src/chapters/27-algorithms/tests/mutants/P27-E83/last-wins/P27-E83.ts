// P27-E83: groupBy עם generics
export function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = keyOf(item);
    const list = out.get(k);
    out.set(k, [...(list ?? []), item].slice(-1));
  }
  return out;
}

export function countBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, number> {
  const out = new Map<K, number>();
  for (const item of items) {
    const k = keyOf(item);
    out.set(k, (out.get(k) ?? 0) + 1);
  }
  return out;
}
