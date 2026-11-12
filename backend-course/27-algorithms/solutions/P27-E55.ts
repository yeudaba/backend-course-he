// P27-E55: LRU עם TTL
export function createTtlLru<V>(capacity: number, ttlMs: number, now: () => number = Date.now) {
  const map = new Map<string, { value: V; expiresAt: number }>();
  return {
    get(key: string): V | undefined {
      const e = map.get(key);
      if (!e) return undefined;
      map.delete(key);
      if (now() >= e.expiresAt) return undefined;
      map.set(key, e);
      return e.value;
    },
    set(key: string, value: V) {
      map.delete(key);
      map.set(key, { value, expiresAt: now() + ttlMs });
      while (map.size > capacity) {
        map.delete(map.keys().next().value as string);
      }
    },
    size() {
      for (const [k, e] of map) if (now() >= e.expiresAt) map.delete(k);
      return map.size;
    },
  };
}
