// P15-E56: timeout ל־route אסינכרוני
import express, { type Request, type Response, type NextFunction } from "express";

export function withTimeout(handler: (req: Request, res: Response) => Promise<unknown>, ms: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({ error: { code: "TIMEOUT", message: "הבקשה לקחה יותר מדי זמן" } });
      }
    }, ms);
    try {
      await handler(req, res);
    } catch (err) {
      if (!res.headersSent) next(err);
    } finally {
      clearTimeout(timer);
    }
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const app = express();
app.get(
  "/fast",
  withTimeout(async (req, res) => {
    await sleep(10);
    res.json({ ok: true });
  }, 100),
);
app.get(
  "/slow",
  withTimeout(async (req, res) => {
    await sleep(300);
    if (!res.headersSent) res.json({ ok: true });
  }, 100),
);
const server = app.listen(0, async () => {
  const address = server.address();
  const base = `http://localhost:${typeof address === "object" && address ? address.port : 0}`;
  for (const path of ["/fast", "/slow"]) {
    const start = Date.now();
    const res = await fetch(base + path);
    console.log(path, res.status, await res.text(), Date.now() - start < 250 ? "(מהר)" : "(איטי)");
  }
  await sleep(300);
  server.close();
});
