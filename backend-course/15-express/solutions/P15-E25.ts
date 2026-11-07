// P15-E25
import express, { type Request, type Response, type NextFunction } from "express";

type Entry = { requestBody: string; state: "running" | "done"; status?: number; body?: unknown };

export function idempotency() {
  const store = new Map<string, Entry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.get("idempotency-key");
    if (!key) {
      res.status(400).json({ error: { code: "MISSING_IDEMPOTENCY_KEY", message: "חסר Idempotency-Key" } });
      return;
    }
    const requestBody = JSON.stringify(req.body ?? null);
    const existing = store.get(key);
    if (existing) {
      if (existing.requestBody !== requestBody) {
        res.status(422).json({ error: { code: "IDEMPOTENCY_KEY_REUSED", message: "המפתח שומש לבקשה אחרת" } });
        return;
      }
      if (existing.state === "running") {
        res.status(409).json({ error: { code: "REQUEST_IN_PROGRESS", message: "הבקשה המקורית עדיין מעובדת" } });
        return;
      }
      res.status(existing.status!).set("Idempotent-Replayed", "true").json(existing.body);
      return;
    }

    const entry: Entry = { requestBody, state: "running" };
    store.set(key, entry);
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 500) store.delete(key); // תקלה זמנית — מותר לנסות שוב
      else Object.assign(entry, { state: "done", status: res.statusCode, body });
      return originalJson(body);
    };
    next();
  };
}

export function createApp() {
  const app = express();
  app.use(express.json());
  const orders: Record<string, unknown>[] = [];

  app.get("/orders", (req, res) => {
    res.json(orders);
  });
  app.post("/orders", idempotency(), async (req, res) => {
    await new Promise((r) => setTimeout(r, 50));
    const order = { id: orders.length + 1, ...req.body };
    orders.push(order);
    res.status(201).json(order);
  });
  return app;
}
