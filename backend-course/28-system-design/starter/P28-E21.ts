// P28-E21: "תשלום שנדחה נשלח שוב ושוב, אלף לקוחות חוזרים באותה מילישנייה, וכשהכול נכשל — מחכים לחינם" — שלוש תקלות
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
      await sleep(baseMs * 2 ** attempt);
      if (attempt >= retries) throw err;
    }
  }
}
