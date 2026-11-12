// P24-E80: fixed window
export function createFixedWindow({ limit, windowMs, now }: { limit: number; windowMs: number; now: () => number }) {
  const counters = new Map<string, { start: number; count: number }>();
  return {
    hit(key: string) {
      const t = now();
      const start = Math.floor(t / windowMs) * windowMs;
      let entry = counters.get(key);
      if (!entry || entry.start !== start) {
        entry = { start, count: 0 };
        counters.set(key, entry);
      }
      const allowed = entry.count < limit;
      if (allowed) entry.count++; // בקשה שנדחתה לא נספרת
      return { allowed, remaining: Math.max(0, limit - entry.count), resetSeconds: Math.ceil((start + windowMs - t) / 1000) };
    },
    size: () => counters.size,
    sweep() {
      const start = Math.floor(now() / windowMs) * windowMs;
      let removed = 0;
      for (const [key, entry] of counters) {
        if (entry.start < start) {
          counters.delete(key);
          removed++;
        }
      }
      return removed;
    },
  };
}
