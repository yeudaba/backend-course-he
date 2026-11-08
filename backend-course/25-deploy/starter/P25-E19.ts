// P25-E19: retry עם exponential backoff ו־jitter
export class HttpStatusError extends Error {
  status: number;
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

export function isRetryable(err: unknown): boolean {
  return true; // כתוב כאן
}

export function backoffDelays({ retries, baseMs, maxMs, random = Math.random }: { retries: number; baseMs: number; maxMs: number; random?: () => number }): number[] {
  return []; // כתוב כאן
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 3, baseMs = 200, maxMs = 5_000, random = Math.random, sleep = (ms: number) => new Promise((r) => setTimeout(r, ms)) }: { retries?: number; baseMs?: number; maxMs?: number; random?: () => number; sleep?: (ms: number) => Promise<unknown> } = {},
): Promise<T> {
  return fn(1); // כתוב כאן
}
