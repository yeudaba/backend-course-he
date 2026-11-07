// P24-E24
import { createHash, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import express, { type NextFunction, type Request, type Response } from "express";

interface Options {
  clock?: () => Date;
  logSink?: (line: string) => void;
  rateLimitPerMinute?: number;
}
interface Order {
  id: number;
  userId: string;
  item: string;
  quantity: number;
  createdAt: string;
}

export function createApp({ clock = () => new Date(), logSink = (l) => process.stdout.write(l + "\n"), rateLimitPerMinute = 5 }: Options = {}) {
  const app = express();
  app.locals.draining = false;
  const orders: Order[] = [];
  const keys = new Map<string, { fingerprint: string; status: number; body: unknown } | null>();
  const hits = new Map<string, number[]>();

  const log = (level: string, msg: string, fields: Record<string, unknown>) =>
    logSink(JSON.stringify({ time: clock().toISOString(), level, msg, ...fields }));
  const fail = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json({ error: { code, message, requestId: res.locals.requestId } });

  // 1. request id + שורת לוג בסוף כל בקשה
  app.use((req, res, next) => {
    const incoming = req.get("x-request-id");
    res.locals.requestId = incoming && /^[A-Za-z0-9._-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    res.setHeader("X-Request-Id", res.locals.requestId);
    const started = performance.now();
    res.on("finish", () => {
      const path = req.originalUrl.split("?")[0];
      const status = res.statusCode;
      log(status >= 500 ? "error" : status >= 400 ? "warn" : "info", "request", {
        requestId: res.locals.requestId,
        ...(res.locals.userId ? { userId: res.locals.userId } : {}),
        method: req.method,
        path,
        status,
        durationMs: Math.round(performance.now() - started),
      });
    });
    next();
  });

  app.use(express.json());

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.get("/ready", (req, res) => (app.locals.draining ? fail(res, 503, "DRAINING", "השרת בכיבוי") : res.json({ status: "ready" })));

  // 2. "אימות" פשוט לתרגיל: x-user-id
  const auth = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.get("x-user-id");
    if (!userId) return fail(res, 401, "UNAUTHORIZED", "חסר x-user-id");
    res.locals.userId = userId;
    next();
  };

  // 3. הגבלת קצב לכל משתמש
  const limit = (req: Request, res: Response, next: NextFunction) => {
    const t = clock().getTime();
    const recent = (hits.get(res.locals.userId) ?? []).filter((x) => x > t - 60_000);
    if (recent.length >= rateLimitPerMinute) {
      hits.set(res.locals.userId, recent);
      res.setHeader("Retry-After", String(Math.ceil((recent[0] + 60_000 - t) / 1000)));
      return fail(res, 429, "TOO_MANY_REQUESTS", "יותר מדי הזמנות בדקה");
    }
    recent.push(t);
    hits.set(res.locals.userId, recent);
    next();
  };

  app.get("/orders", auth, (req, res) => res.json(orders.filter((o) => o.userId === res.locals.userId)));

  app.post("/orders", auth, limit, (req, res) => {
    const key = req.get("idempotency-key");
    if (!key || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) return fail(res, 400, "IDEMPOTENCY_KEY_REQUIRED", "POST /orders דורש Idempotency-Key תקין");
    const id = JSON.stringify([res.locals.userId, key]);
    const fingerprint = createHash("sha256").update(JSON.stringify(req.body ?? null)).digest("hex");
    const prev = keys.get(id);
    if (prev === null) return fail(res, 409, "IDEMPOTENCY_IN_PROGRESS", "בקשה עם המפתח הזה בטיפול");
    if (prev && prev.fingerprint !== fingerprint) return fail(res, 422, "IDEMPOTENCY_KEY_REUSED", "המפתח שימש לבקשה אחרת");
    if (prev) return res.status(prev.status).set("Idempotent-Replayed", "true").json(prev.body);

    const { item, quantity } = req.body ?? {};
    if (typeof item !== "string" || item.trim() === "" || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return fail(res, 400, "VALIDATION_ERROR", "item: מחרוזת לא ריקה; quantity: מספר שלם 1–100"); // לא נשמר — אפשר לתקן ולשלוח שוב
    }
    const order: Order = { id: orders.length + 1, userId: res.locals.userId, item: item.trim(), quantity, createdAt: clock().toISOString() };
    orders.push(order);
    keys.set(id, { fingerprint, status: 201, body: order });
    res.status(201).location(`/orders/${order.id}`).json(order);
  });

  app.use((req, res) => fail(res, 404, "NOT_FOUND", "אין נתיב כזה"));
  app.use((err: Error & { type?: string }, req: Request, res: Response, next: NextFunction) => {
    if (err.type === "entity.parse.failed") return fail(res, 400, "INVALID_JSON", "JSON לא תקין");
    log("error", err.message, { requestId: res.locals.requestId, stack: err.stack });
    fail(res, 500, "INTERNAL", "שגיאה פנימית");
  });
  return app;
}
