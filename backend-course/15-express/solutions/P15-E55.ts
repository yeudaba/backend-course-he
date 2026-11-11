// P15-E55: מדדים לשרת
import express, { type Request, type Response, type NextFunction } from "express";

export function createMetrics(now = () => performance.now()) {
  let total = 0;
  let sumMs = 0;
  let maxMs = 0;
  let slowest: string | null = null;
  const byStatus: Record<string, number> = {};

  function middleware(req: Request, res: Response, next: NextFunction) {
    const start = now();
    res.on("finish", () => {
      const ms = now() - start;
      total++;
      sumMs += ms;
      const key = `${Math.floor(res.statusCode / 100)}xx`;
      byStatus[key] = (byStatus[key] ?? 0) + 1;
      if (slowest === null || ms > maxMs) {
        maxMs = ms;
        slowest = `${req.method} ${req.originalUrl}`;
      }
    });
    next();
  }

  const snapshot = () => ({
    total,
    byStatus: { ...byStatus },
    avgMs: total === 0 ? 0 : Math.round(sumMs / total),
    maxMs,
    slowest,
  });

  return { middleware, snapshot };
}

const metrics = createMetrics();
const app = express();
app.use(metrics.middleware);
app.get("/fast", (req, res) => {
  res.json("ok");
});
app.get("/slow", async (req, res) => {
  await new Promise((r) => setTimeout(r, 50));
  res.json("ok");
});
const server = app.listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  await fetch(`${base}/fast`);
  await fetch(`${base}/slow?x=1`);
  await fetch(`${base}/nope`);
  await new Promise((r) => setTimeout(r, 10));
  const s = metrics.snapshot();
  console.log(s.total, JSON.stringify(s.byStatus), s.slowest, s.maxMs >= 50 ? "maxMs ≥ 50" : "?");
  server.close();
});
