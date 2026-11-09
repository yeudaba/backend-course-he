// P29.5-E18: הגבלת מקביליות לכל כלי — המודל ביקש 8 שאילתות במקביל; המסד מחזיק 2
export function createLimiter(limits: Record<string, number>, defaultLimit = 4) {
  const active = new Map<string, number>();
  const queues = new Map<string, (() => void)[]>();
  const limitOf = (name: string) => limits[name] ?? defaultLimit;

  async function acquire(name: string) {
    if ((active.get(name) ?? 0) < limitOf(name)) {
      active.set(name, (active.get(name) ?? 0) + 1);
      return;
    }
    await new Promise<void>((resolve) => {
      const q = queues.get(name) ?? [];
      q.push(resolve);
      queues.set(name, q);
    });
  }
  function release(name: string) {
    const next = queues.get(name)?.shift();
    if (next) next(); // המקום עובר ישר לממתין הבא — active לא משתנה
    else active.set(name, (active.get(name) ?? 1) - 1);
  }
  return {
    async run<T>(name: string, fn: () => Promise<T>): Promise<T> {
      await acquire(name);
      try {
        return await fn();
      } finally {
        release(name);
      }
    },
    active: (name: string) => active.get(name) ?? 0,
  };
}
