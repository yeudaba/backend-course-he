// P24-E88: לקוח שמכבד Retry-After
export async function fetchPolitely(
  fetchFn: typeof fetch,
  url: string,
  init: RequestInit,
  { sleep, maxRetries = 2, maxWaitSeconds = 60 }: { sleep: (ms: number) => Promise<void>; maxRetries?: number; maxWaitSeconds?: number },
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetchFn(url, init);
    if (res.status !== 429 && res.status !== 503) return res;
    const ra = res.headers.get("retry-after");
    if (ra === null || !/^\d+$/.test(ra)) return res;
    const seconds = Number(ra);
    if (seconds > maxWaitSeconds || attempt >= maxRetries) return res;
    await res.body?.cancel(); // לא קוראים את הגוף — משחררים את החיבור
    await sleep(seconds * 1000);
  }
}
