// P25-E10: בדיקת עשן אחרי deploy
export interface SmokeResult {
  ok: boolean;
  attempts: number;
  commit: string | null;
}

export async function smokeTest(
  baseUrl: string,
  { expectCommit, timeoutMs = 600_000, intervalMs = 5_000, now = () => Date.now() }: { expectCommit?: string; timeoutMs?: number; intervalMs?: number; now?: () => number } = {},
): Promise<SmokeResult> {
  return { ok: false, attempts: 0, commit: null }; // כתוב כאן
}
