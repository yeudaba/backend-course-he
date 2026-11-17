// P27-E83: groupBy עם generics
export function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = keyOf(item);
    const list = out.get(k);
    if (list) list.push(item);
    else out.set(k, [item]);
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
