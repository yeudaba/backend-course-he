// P25-E10
export interface SmokeResult {
  ok: boolean;
  attempts: number;
  commit: string | null;
}

export async function smokeTest(
  baseUrl: string,
  { expectCommit, timeoutMs = 600_000, intervalMs = 5_000, now = () => Date.now() }: { expectCommit?: string; timeoutMs?: number; intervalMs?: number; now?: () => number } = {},
): Promise<SmokeResult> {
  const started = now();
  let attempts = 0;
  let commit: string | null = null;
  while (true) {
    attempts++;
    try {
      const v = await fetch(new URL("/version", baseUrl), { signal: AbortSignal.timeout(10_000) });
      if (v.status === 200) {
        commit = ((await v.json()) as { commit?: string }).commit ?? null;
        // אותו commit (מלא או מקוצר) — הגרסה החדשה רצה. ואז: מוכנה?
        if (!expectCommit || (commit !== null && (commit.startsWith(expectCommit) || expectCommit.startsWith(commit)) && commit.length >= 7)) {
          const r = await fetch(new URL("/ready", baseUrl), { signal: AbortSignal.timeout(10_000) });
          if (r.status === 200) return { ok: true, attempts, commit };
        }
      }
    } catch {
      // השרת עוד לא עונה (build, התעוררות) — זה צפוי, מנסים שוב
    }
    if (now() - started + intervalMs > timeoutMs) return { ok: false, attempts, commit };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
