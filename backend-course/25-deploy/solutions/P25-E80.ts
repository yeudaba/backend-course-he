// P25-E80: /ready שיודע על כיבוי
import type { Request, Response } from "express";

export function createHealth({ checkDb, timeoutMs }: { checkDb: () => Promise<unknown>; timeoutMs: number }) {
  let draining = false;
  const withTimeout = async (p: Promise<unknown>) => {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([p, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), timeoutMs); })]);
    } finally {
      clearTimeout(timer);
    }
  };
  return {
    health(req: Request, res: Response) {
      res.set("Cache-Control", "no-store").json({ status: "ok" });
    },
    async ready(req: Request, res: Response) {
      res.set("Cache-Control", "no-store");
      if (draining) {
        res.status(503).json({ status: "draining" });
        return;
      }
      try {
        await withTimeout(checkDb());
        res.json({ status: "ok" });
      } catch {
        res.status(503).json({ status: "unavailable" });
      }
    },
    startDraining() {
      draining = true;
    },
  };
}
