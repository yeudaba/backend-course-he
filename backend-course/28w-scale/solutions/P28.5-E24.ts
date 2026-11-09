// P28.5-E24: API אנליטיקה מעל Parquet — DuckDB בתוך התהליך, cache, ו־p95 נמוך תחת עומס
import http from "node:http";
import { DuckDBInstance } from "@duckdb/node-api";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isDay = (s: string | null): s is string => !!s && DAY.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

class TtlLru<V> {
  private map = new Map<string, { value: V; expires: number }>();
  private max: number;
  private ttlMs: number;
  private now: () => number;
  constructor(max: number, ttlMs: number, now: () => number) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.now = now;
  }
  get(k: string): V | undefined {
    const e = this.map.get(k);
    if (!e) return undefined;
    if (e.expires <= this.now()) {
      this.map.delete(k);
      return undefined;
    }
    this.map.delete(k); // LRU: הכי חדש בסוף
    this.map.set(k, e);
    return e.value;
  }
  set(k: string, value: V) {
    this.map.delete(k);
    this.map.set(k, { value, expires: this.now() + this.ttlMs });
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value!);
  }
}

export async function createAnalyticsServer({ parquetPath, cacheTtlMs = 60_000, cacheSize = 100, now = Date.now }: { parquetPath: string; cacheTtlMs?: number; cacheSize?: number; now?: () => number }): Promise<http.Server> {
  const db = await DuckDBInstance.create(":memory:");
  const conn = await db.connect();
  // טוענים פעם אחת לזיכרון, עם עמודת יום מחושבת (שעון ישראל) — כל שאילתה אחר כך מהירה
  await conn.run(
    `CREATE TABLE orders AS SELECT *, strftime(timezone('Asia/Jerusalem', created_at), '%Y-%m-%d') AS day FROM read_parquet($1)`,
    [parquetPath],
  );
  const cache = new TtlLru<string>(cacheSize, cacheTtlMs, now);

  async function revenue(from: string, to: string) {
    const r = await conn.runAndReadAll(
      `SELECT day, count(*)::INTEGER AS orders, round(sum(quantity * price_cents) / 100.0, 2)::DOUBLE AS revenue
       FROM orders WHERE day BETWEEN $1 AND $2 GROUP BY day ORDER BY day`,
      [from, to],
    );
    const days = r.getRowObjects().map((x) => ({ day: String(x.day), orders: Number(x.orders), revenue: Number(x.revenue) }));
    const total = { orders: days.reduce((s, d) => s + d.orders, 0), revenue: Math.round(days.reduce((s, d) => s + d.revenue * 100, 0)) / 100 };
    return { from, to, days, total };
  }
  async function topProducts(day: string, limit: number) {
    const r = await conn.runAndReadAll(
      `SELECT product, sum(quantity)::INTEGER AS units, round(sum(quantity * price_cents) / 100.0, 2)::DOUBLE AS revenue
       FROM orders WHERE day = $1 GROUP BY product ORDER BY revenue DESC, product LIMIT $2`,
      [day, limit],
    );
    return r.getRowObjects().map((x) => ({ product: String(x.product), units: Number(x.units), revenue: Number(x.revenue) }));
  }

  const send = (res: http.ServerResponse, status: number, body: unknown, cacheState?: string) => {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    if (cacheState) res.setHeader("x-cache", cacheState);
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    try {
      if (url.pathname === "/health") return send(res, 200, { ok: true });
      let key: string;
      let compute: () => Promise<unknown>;
      if (url.pathname === "/revenue") {
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!isDay(from) || !isDay(to)) return send(res, 400, { error: "from ו־to בפורמט YYYY-MM-DD" });
        if (daysBetween(from, to) < 0) return send(res, 400, { error: "from אחרי to" });
        if (daysBetween(from, to) > 92) return send(res, 400, { error: "עד 92 ימים" });
        key = `revenue:${from}:${to}`;
        compute = () => revenue(from, to);
      } else if (url.pathname === "/top-products") {
        const day = url.searchParams.get("day");
        const limit = Number(url.searchParams.get("limit") ?? 5);
        if (!isDay(day)) return send(res, 400, { error: "day בפורמט YYYY-MM-DD" });
        if (!Number.isInteger(limit) || limit < 1 || limit > 20) return send(res, 400, { error: "limit בין 1 ל־20" });
        key = `top:${day}:${limit}`;
        compute = () => topProducts(day, limit);
      } else return send(res, 404, { error: "not found" });

      const hit = cache.get(key);
      if (hit !== undefined) return send(res, 200, hit, "HIT");
      const body = JSON.stringify(await compute());
      cache.set(key, body);
      send(res, 200, body, "MISS");
    } catch {
      send(res, 500, { error: "internal" });
    }
  });
  server.on("close", () => {
    conn.closeSync();
    db.closeSync();
  });
  return server;
}
