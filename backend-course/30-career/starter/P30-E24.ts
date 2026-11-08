// P30-E24: checkUrls — מטלת בית: בודק זמינות
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
  options: { concurrency?: number; timeoutMs?: number; retries?: number; now?: () => number } = {},
): Promise<{ results: UrlResult[]; up: number; down: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
