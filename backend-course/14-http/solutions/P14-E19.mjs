// P14-E19
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(url, init = {}, { retries = 2, delayMs = 200 } = {}) {
  let lastError;
  let lastResponse;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(delayMs * 2 ** (attempt - 1));
    try {
      lastResponse = await fetch(url, init);
      lastError = undefined;
      if (!RETRYABLE.has(lastResponse.status)) return lastResponse;
    } catch (err) {
      lastError = err;
      lastResponse = undefined;
    }
  }
  if (lastError) throw lastError;
  return lastResponse;
}
