// P28-E12: retry עם exponential backoff ו־jitter
export class HttpError extends Error {
  status: number;
  constructor(status: number, message = `HTTP ${status}`) {
    super(message);
    this.status = status;
  }
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: { retries?: number; baseMs?: number; maxMs?: number; random?: () => number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<T> {
  throw new Error("עוד לא כתבת את הפתרון");
}
