// P29-E82: תקציב יומי ב־Redis
// כתוב וייצא:
//   export function createRedisBudget(redis: Redis, opts: { dailyUsdPerUser: number; now?: () => number }): {
//     check(userId: string): Promise<{ allowed: boolean; remainingUsd: number }>;
//     record(userId: string, usd: number): Promise<void>;
//   }
//
// בדיקה:  npm run check P29-E82
