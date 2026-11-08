// P29-E17: createBudget — תקציב יומי לכל משתמש
export function createBudget(options: { dailyUsdPerUser: number; now?: () => number }): {
  check(userId: string): { allowed: boolean; remainingUsd: number };
  record(userId: string, usd: number): void;
} {
  throw new Error("עוד לא כתבת את הפתרון");
}
