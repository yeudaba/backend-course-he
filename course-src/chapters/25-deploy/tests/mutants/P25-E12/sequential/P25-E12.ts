// P25-E12
import type { Request, Response } from "express";

type Check = () => Promise<unknown>;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

export function readyHandler(checks: Record<string, Check>, { timeoutMs = 1000 }: { timeoutMs?: number } = {}) {
  return async (req: Request, res: Response) => {
    // במקביל: בדיקה איטית אחת לא מעכבת את האחרות, וכולן מוגבלות בזמן
    const results: (readonly [string, string])[] = [];
    for (const [name, check] of Object.entries(checks)) results.push(await (async () => {
        try {
          await withTimeout(Promise.resolve().then(check), timeoutMs);
          return [name, "up"] as const;
        } catch (err) {
          return [name, (err as Error).message === "timeout" ? "timeout" : "down"] as const;
        }
      })());
    const ok = results.every(([, s]) => s === "up");
    res.status(ok ? 200 : 503).set("Cache-Control", "no-store").json({ status: ok ? "ok" : "unavailable", checks: Object.fromEntries(results) });
  };
}
