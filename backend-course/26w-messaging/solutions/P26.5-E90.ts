// P26.5-E90: סדר בתוך key, מקביליות בין keys
export function perKeySerial<M extends { key: string }>(handler: (m: M) => Promise<void>) {
  const tails = new Map<string, Promise<void>>();
  const all = new Set<Promise<void>>();
  return {
    push(m: M) {
      const prev = tails.get(m.key) ?? Promise.resolve();
      const run = prev.then(() => handler(m));
      const tail = run.catch(() => {});
      tails.set(m.key, tail);
      all.add(tail);
      tail.then(() => {
        all.delete(tail);
        if (tails.get(m.key) === tail) tails.delete(m.key);
      });
      return run;
    },
    async idle() {
      while (all.size) await Promise.all([...all]);
    },
  };
}
