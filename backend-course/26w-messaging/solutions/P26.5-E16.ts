// P26.5-E16: מתי לנסות שוב, ומתי לוותר — exponential backoff עם jitter
export type RetryDecision = { action: "retry"; delayMs: number } | { action: "dead-letter"; reason: string };

export interface RetryOptions {
  baseMs?: number;
  maxMs?: number;
  maxAttempts?: number;
  random?: () => number;
}

export function isPermanent(err: any): boolean {
  if (err?.permanent === true) return true;
  const s = err?.status;
  return typeof s === "number" && s >= 400 && s < 500 && s !== 408 && s !== 429; // 4xx — לא ישתנה בניסיון חוזר
}

// attempt = כמה ניסיונות כבר נכשלו (1 אחרי הכישלון הראשון)
export function nextRetry(attempt: number, err: unknown, { baseMs = 500, maxMs = 30_000, maxAttempts = 5, random = Math.random }: RetryOptions = {}): RetryDecision {
  if (isPermanent(err)) return { action: "dead-letter", reason: "permanent" };
  if (attempt >= maxAttempts) return { action: "dead-letter", reason: "max-attempts" };
  const cap = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
  let delayMs = Math.floor(random() * cap); // "full jitter": אקראי בין 0 לתקרה — כדי שאלף consumers לא יחזרו באותה שנייה
  const retryAfter = (err as any)?.retryAfterMs;
  if (typeof retryAfter === "number" && retryAfter > delayMs) delayMs = Math.min(retryAfter, maxMs);
  return { action: "retry", delayMs };
}
