// P30-E24
// מטלת בית טיפוסית: "בודק זמינות" לרשימת כתובות. מה בודקים במטלה כזו: מקביליות מוגבלת, timeout,
// retry רק כשזה הגיוני, תוצאות בסדר הקלט, ושגיאה של אחד לא מפילה את כולם
export type Check = (url: string, signal: AbortSignal) => Promise<{ status: number }>;
export interface UrlResult {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
  attempts: number;
  ms: number;
}

export async function checkUrls(
  urls: readonly string[],
  check: Check,
  { concurrency = 5, timeoutMs = 3000, retries = 1, now = () => Date.now() }: { concurrency?: number; timeoutMs?: number; retries?: number; now?: () => number } = {},
): Promise<{ results: UrlResult[]; up: number; down: number }> {
  const results: UrlResult[] = new Array(urls.length);

  async function once(url: string): Promise<{ status?: number; error?: string }> {
    const ac = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        ac.abort();
        reject(new Error("timeout"));
      }, timeoutMs);
    });
    try {
      const r = await Promise.race([check(url, ac.signal), timeout]);
      return { status: r.status };
    } catch (err) {
      return { error: (err as Error).message };
    } finally {
      clearTimeout(timer);
    }
  }

  async function run(i: number) {
    const url = urls[i];
    const start = now();
    let attempts = 0;
    let last: { status?: number; error?: string } = {};
    while (attempts <= retries) {
      attempts++;
      last = await once(url);
      const retryable = last.error !== undefined || (last.status ?? 0) >= 500;
      if (!retryable) break; // 2xx/3xx/4xx — תשובה סופית; 404 לא יהפוך ל־200 בניסיון שני
    }
    const ok = last.status !== undefined && last.status < 400;
    results[i] = { url, ok, ...(last.status !== undefined ? { status: last.status } : {}), ...(last.error ? { error: last.error } : {}), attempts, ms: now() - start };
  }

  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (next < urls.length) await run(next++);
  }));
  const up = results.filter((r) => r.ok).length;
  return { results, up, down: results.length - up };
}
