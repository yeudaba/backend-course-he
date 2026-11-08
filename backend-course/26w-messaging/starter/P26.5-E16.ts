// P26.5-E16: מתי לנסות שוב, ומתי לוותר — exponential backoff עם jitter
export type RetryDecision = { action: "retry"; delayMs: number } | { action: "dead-letter"; reason: string };

export interface RetryOptions {
  baseMs?: number;
  maxMs?: number;
  maxAttempts?: number;
  random?: () => number;
}

export function isPermanent(err: any): boolean {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function nextRetry(attempt: number, err: unknown, { baseMs = 500, maxMs = 30_000, maxAttempts = 5, random = Math.random }: RetryOptions = {}): RetryDecision {
  throw new Error("עוד לא כתבת את הפתרון");
}
