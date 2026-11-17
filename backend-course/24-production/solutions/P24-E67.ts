// P24-E67: לקוח שמנסה שוב — עם אותו מפתח
export type Send = (body: unknown, key: string) => Promise<{ status: number; body: unknown }>;

const retryable = (status: number) => status >= 500 || status === 409;

export async function sendWithRetry(
  send: Send,
  body: unknown,
  { retries, sleep, newKey }: { retries: number; sleep: (ms: number) => Promise<void>; newKey: () => string },
) {
  const key = newKey(); // מפתח אחד לפעולה — לא לניסיון
  let lastError: unknown;
  let lastResponse: { status: number; body: unknown } | undefined;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    if (attempt > 1) await sleep(200 * 2 ** (attempt - 2));
    try {
      lastResponse = await send(body, key);
      lastError = undefined;
      if (!retryable(lastResponse.status)) return { ...lastResponse, attempts: attempt, key };
    } catch (err) {
      lastError = err;
      lastResponse = undefined;
    }
    if (attempt === retries + 1) {
      if (lastResponse) return { ...lastResponse, attempts: attempt, key };
      throw lastError;
    }
  }
  throw new Error("unreachable");
}
