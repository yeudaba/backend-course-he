// P27-E101: smoke test אחרי deploy
type Check = { path: string; status: number; contains?: string };

async function runCheck(baseUrl: string, c: Check, timeoutMs: number): Promise<string | null> {
  try {
    const res = await fetch(baseUrl + c.path, { signal: AbortSignal.timeout(timeoutMs) });
    const body = await res.text();
    if (res.status !== c.status) return `status ${res.status}`;
    if (c.contains !== undefined && !body.includes(c.contains)) return "missing text";
    return null;
  } catch (err) {
    return (err as Error).name === "TimeoutError" ? "timeout" : "network";
  }
}

export async function smokeTest(baseUrl: string, checks: Check[], timeoutMs: number) {
  const reasons = await Promise.all(checks.map((c) => runCheck(baseUrl, c, timeoutMs)));
  const failures = checks.flatMap((c, i) => (reasons[i] ? [{ path: c.path, reason: reasons[i]! }] : []));
  return { ok: failures.length === 0, failures };
}
