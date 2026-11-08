// P19.5-E15
// InnoDB מזהה deadlock ומבטל את אחת הטרנזקציות (errno 1213, ER_LOCK_DEADLOCK); המתנה ארוכה לנעילה — 1205.
// שתיהן "בטוחות לנסות שוב": הטרנזקציה בוטלה כולה. מנסים שוב את *כל* הטרנזקציה, עם המתנה קצרה ואקראית
export const RETRYABLE = new Set([1213, 1205]);

export async function withDeadlockRetry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 3, sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)), random = Math.random } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      const errno = (err as { errno?: number }).errno;
      if (attempt >= retries || errno === undefined || !RETRYABLE.has(errno)) throw err;
      await sleep(Math.floor(random() * 20 * 2 ** attempt));
    }
  }
}
