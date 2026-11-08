// P28-E12
// retry עם exponential backoff ו־jitter: לא כל הלקוחות חוזרים באותה שנייה (thundering herd)
export class HttpError extends Error {
  status: number;
  constructor(status: number, message = `HTTP ${status}`) {
    super(message);
    this.status = status;
  }
}

// מה שווה לנסות שוב: רשת, 5xx, 429. 4xx אחר — הבקשה שגויה, ניסיון נוסף ייכשל באותה דרך
export const isRetryable = (err: unknown) => !(err instanceof HttpError) || err.status >= 500 || err.status === 429;

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  {
    retries = 3,
    baseMs = 100,
    maxMs = 5000,
    random = Math.random,
    sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
  }: { retries?: number; baseMs?: number; maxMs?: number; random?: () => number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) throw err; // לא ישנים אחרי הניסיון האחרון
      const cap = Math.min(maxMs, baseMs * 2 ** attempt);
      await sleep(Math.floor(random() * cap)); // "full jitter": בין 0 לתקרה
    }
  }
}
