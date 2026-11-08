// P29-E17
// תקציב יומי למשתמש: כל קריאה עולה כסף, ומשתמש אחד (או סקריפט) יכול לשרוף את התקציב של כולם.
// בודקים לפני הקריאה, רושמים אחרי (לפי usage אמיתי), ומתאפסים בחצות UTC
export function createBudget({ dailyUsdPerUser, now = () => Date.now() }: { dailyUsdPerUser: number; now?: () => number }) {
  const spent = new Map<string, number>(); // `${day}:${userId}` ← מיקרו־דולרים (שלמים — בלי שגיאות עיגול)
  const day = () => new Date(now()).toISOString().slice(0, 10);
  const key = (userId: string) => `${day()}:${userId}`;
  const limit = Math.round(dailyUsdPerUser * 1_000_000);
  return {
    check(userId: string): { allowed: boolean; remainingUsd: number } {
      const used = spent.get(key(userId)) ?? 0;
      return { allowed: used < limit, remainingUsd: Math.max(0, limit - used) / 1_000_000 };
    },
    record(userId: string, usd: number) {
      if (!(usd >= 0)) throw new Error("עלות לא תקינה");
      const k = key(userId);
      spent.set(k, (spent.get(k) ?? 0) + Math.round(usd * 1_000_000));
      for (const old of spent.keys()) if (!old.startsWith(day() + ":")) spent.delete(old); // לא שומרים ימים קודמים
    },
  };
}
