// P26.3-E84: לחכות ל־Synced ו־Healthy
type Status = { sync: string; health: string };
type Opts = { timeoutMs: number; intervalMs: number; sleep?: (ms: number) => Promise<void>; now?: () => number };

export async function waitForSync(getStatus: () => Promise<Status>, { timeoutMs, intervalMs, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), now = Date.now }: Opts) {
  const start = now();
  for (;;) {
    let s: Status | null = null;
    try {
      s = await getStatus();
    } catch {
      // תקלה רגעית ב־API — ממשיכים לנסות
    }
    if (s?.health === "Degraded") throw new Error("DEGRADED");
    if (s?.sync === "Synced" && s.health === "Healthy") return s;
    if (now() - start >= timeoutMs) throw new Error("TIMEOUT");
    await sleep(intervalMs);
  }
}
