// P25-E19
export class HttpStatusError extends Error {
  status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

// לנסות שוב — רק כשיש סיכוי שזה יעזור
export function isRetryable(err: unknown): boolean {
  if (err instanceof HttpStatusError) return err.status === 429 || err.status >= 500; // 4xx אחר — הבקשה עצמה שגויה
  return true; // שגיאת רשת: ECONNRESET, timeout
}

export function backoffDelays({ retries, baseMs, maxMs, random = Math.random }: { retries: number; baseMs: number; maxMs: number; random?: () => number }): number[] {
  // exponential backoff עם "full jitter": אקראי בין 0 לתקרה — כך אלף לקוחות לא חוזרים באותה שנייה
  return Array.from({ length: retries }, (_, i) => Math.floor(random() * Math.min(maxMs, baseMs * 2 ** i)));
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 3, baseMs = 200, maxMs = 5_000, random = Math.random, sleep = (ms: number) => new Promise((r) => setTimeout(r, ms)) }: { retries?: number; baseMs?: number; maxMs?: number; random?: () => number; sleep?: (ms: number) => Promise<unknown> } = {},
): Promise<T> {
  const delays = backoffDelays({ retries, baseMs, maxMs, random });
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt > retries || !isRetryable(err)) throw err;
      await sleep(delays[attempt - 1]);
    }
  }
}
