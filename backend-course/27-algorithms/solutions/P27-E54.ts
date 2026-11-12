// P27-E54: הגבלת קצב בחלון נע — זיכרון קבוע לכל לקוח
export function createSlidingLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const log = new Map<string, number[]>();
  const prune = (clientId: string, now: number) => {
    const times = log.get(clientId);
    if (!times) return [];
    while (times.length && times[0] <= now - windowMs) times.shift();
    if (times.length === 0) log.delete(clientId);
    return times;
  };
  return {
    hit(clientId: string, now: number) {
      const times = prune(clientId, now);
      if (times.length >= limit) return false;
      if (times.length === 0) log.set(clientId, times);
      times.push(now);
      return true;
    },
    tracked(clientId: string) {
      return log.get(clientId)?.length ?? 0;
    },
  };
}
