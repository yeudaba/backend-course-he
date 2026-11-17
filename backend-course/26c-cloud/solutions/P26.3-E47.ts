// P26.3-E47: retry ל־ThrottlingException
type Opts = { retries?: number; baseMs?: number; sleep?: (ms: number) => Promise<void>; random?: () => number };

const RETRYABLE = new Set(["ThrottlingException", "SlowDown", "RequestLimitExceeded"]);

function retryable(err: unknown) {
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  return RETRYABLE.has(e?.name ?? "") || (e?.$metadata?.httpStatusCode ?? 0) >= 500;
}

export async function withAwsRetry<T>(fn: () => Promise<T>, opts: Opts = {}): Promise<T> {
  const { retries = 3, baseMs = 100, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), random = Math.random } = opts;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!retryable(err) || attempt >= retries) throw err;
      await sleep(Math.floor(random() * baseMs * 2 ** attempt));
    }
  }
}
