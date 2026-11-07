// P22-E09 — הקוד שבודקים (לא משנים אותו)
export class HttpStatusError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

// שגיאות 5xx ושגיאות רשת — שווה לנסות שוב. 4xx — לא (הבקשה עצמה שגויה)
const isRetryable = (err: unknown) => !(err instanceof HttpStatusError) || err.status >= 500;

// מריץ את fn; על שגיאה שאפשר לנסות שוב — עד retries ניסיונות נוספים. בסוף זורק את השגיאה האחרונה
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err)) throw err;
    }
  }
  throw lastError;
}
