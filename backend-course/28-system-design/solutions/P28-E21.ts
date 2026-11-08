// P28-E21
export class HttpError extends Error {
  status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  { retries = 3, baseMs = 100, random = Math.random, sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)) } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // תקלה 1: היה ניסיון חוזר על כל שגיאה ← 400/404/409 נשלחים שוב ושוב, ותשלום שנדחה "מנסים שוב"
      const retryable = !(err instanceof HttpError) || err.status >= 500 || err.status === 429;
      // תקלה 2: הבדיקה הייתה אחרי ה־sleep ← אחרי הניסיון האחרון ישנו לחינם לפני שזרקו
      if (attempt >= retries || !retryable) throw err;
      // תקלה 3: היה baseMs * 2 ** attempt בדיוק ← אלף לקוחות חוזרים יחד באותה מילישנייה. jitter מפזר אותם
      await sleep(Math.floor(random() * baseMs * 2 ** attempt));
    }
  }
}
