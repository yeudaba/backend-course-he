// P28-E09
// load balancer עם health checks: אחרי failThreshold כישלונות ברצף — השרת יוצא מהסבב; אחרי recoverAfterMs — מקבל הזדמנות
export function createBalancer(servers: readonly string[], { failThreshold = 3, recoverAfterMs = 10_000, now = () => Date.now() } = {}) {
  const fails = new Map(servers.map((s) => [s, 0]));
  const downSince = new Map<string, number>();
  let next = 0;

  const isUp = (s: string) => {
    const since = downSince.get(s);
    if (since === undefined) return true;
    if (now() - since >= recoverAfterMs) {
      downSince.delete(s); // הזדמנות שנייה; כישלון אחד נוסף יוריד שוב
      fails.set(s, failThreshold - 1);
      return true;
    }
    return false;
  };

  return {
    pick(): string | null {
      for (let i = 0; i < servers.length; i++) {
        const s = servers[next++ % servers.length];
        if (isUp(s)) return s;
      }
      return null; // כולם למטה — 503 ללקוח
    },
    report(server: string, ok: boolean) {
      if (ok) {
        fails.set(server, 0);
        return;
      }
      const n = (fails.get(server) ?? 0) + 1;
      fails.set(server, n);
      if (n >= failThreshold && !downSince.has(server)) downSince.set(server, now());
    },
    healthy: () => servers.filter((s) => !downSince.has(s) || now() - downSince.get(s)! >= recoverAfterMs),
  };
}
