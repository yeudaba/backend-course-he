// P28.5-E41: timed — למדוד פונקציות אסינכרוניות
export function createTimer(now: () => number = () => performance.now()) {
  const stats = new Map<string, { times: number[]; errors: number }>();
  const entry = (name: string) => {
    if (!stats.has(name)) stats.set(name, { times: [], errors: 0 });
    return stats.get(name)!;
  };

  function timed<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
    return async (...args: A): Promise<R> => {
      const e = entry(name);
      const t0 = now();
      try {
        return await fn(...args);
      } catch (err) {
        e.errors++;
        throw err;
      } finally {
        e.times.push(now() - t0);
      }
    };
  }

  function summary() {
    const out: Record<string, { count: number; errors: number; p50: number; p99: number }> = {};
    for (const [name, e] of stats) {
      const sorted = [...e.times];
      const pct = (p: number) => sorted[Math.ceil((p / 100) * sorted.length) - 1] ?? 0;
      out[name] = { count: sorted.length, errors: e.errors, p50: pct(50), p99: pct(99) };
    }
    return out;
  }

  return { timed, summary };
}
