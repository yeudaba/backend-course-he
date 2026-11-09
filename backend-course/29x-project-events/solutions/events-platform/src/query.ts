// API השאילתות: סטטיסטיקה יומית מ־MySQL, ומשפכים (funnels) מה־lake עם DuckDB
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import type { Pool } from "mysql2/promise";
import { DuckDBInstance } from "@duckdb/node-api";
import { isDay } from "./time.ts";

const NAME = /^[a-z][a-z0-9_]{0,39}$/;
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

export async function createQueryServer({ pool, lakeDir, apiKeys, cacheTtlMs = 30_000, now = Date.now }: { pool: Pool; lakeDir: string; apiKeys: Record<string, string>; cacheTtlMs?: number; now?: () => number }): Promise<http.Server> {
  const duck = await DuckDBInstance.create(":memory:");
  const conn = await duck.connect();
  const cache = new Map<string, { body: string; expires: number }>();

  async function daily(tenant: string, from: string, to: string, name: string | null) {
    const nameSql = name ? "AND name = ?" : "";
    const [ev] = await pool.query<any[]>(
      `SELECT DATE_FORMAT(day, '%Y-%m-%d') AS day, SUM(events) AS events FROM daily_counts WHERE tenant_id = ? AND day BETWEEN ? AND ? ${nameSql} GROUP BY day ORDER BY day`,
      name ? [tenant, from, to, name] : [tenant, from, to],
    );
    const [us] = await pool.query<any[]>(
      `SELECT DATE_FORMAT(day, '%Y-%m-%d') AS day, COUNT(*) AS users FROM user_days WHERE tenant_id = ? AND day BETWEEN ? AND ? GROUP BY day`,
      [tenant, from, to],
    );
    const users = new Map(us.map((r) => [r.day, Number(r.users)]));
    return { from, to, name, days: ev.map((r) => ({ day: r.day, events: Number(r.events), users: users.get(r.day) ?? 0 })) };
  }

  async function funnel(tenant: string, steps: string[], from: string, to: string) {
    const files = fs.existsSync(lakeDir) ? fs.readdirSync(lakeDir).filter((f) => f.endsWith(".parquet")) : [];
    if (!files.length) return { from, to, steps: steps.map((name) => ({ name, users: 0 })) };
    const glob = path.join(lakeDir, "part-*.parquet").replaceAll("'", "''");
    // לכל שלב: המשתמשים שעשו אותו אחרי הפעם הראשונה שעשו את השלב הקודם
    const ctes = [`e AS (SELECT user_id, name, ts FROM read_parquet('${glob}') WHERE tenant_id = $1 AND day BETWEEN CAST($2 AS DATE) AND CAST($3 AS DATE))`, `s1 AS (SELECT user_id, min(ts) AS t FROM e WHERE name = $4 GROUP BY user_id)`];
    for (let i = 2; i <= steps.length; i++) {
      ctes.push(`s${i} AS (SELECT e.user_id, min(e.ts) AS t FROM e JOIN s${i - 1} p ON p.user_id = e.user_id WHERE e.name = $${i + 3} AND e.ts > p.t GROUP BY e.user_id)`);
    }
    const select = steps.map((_, i) => `(SELECT count(*) FROM s${i + 1})::INTEGER AS c${i + 1}`).join(", ");
    const r = await conn.runAndReadAll(`WITH ${ctes.join(", ")} SELECT ${select}`, [tenant, from, to, ...steps]);
    const row = r.getRowObjects()[0];
    return { from, to, steps: steps.map((name, i) => ({ name, users: Number(row[`c${i + 1}`]) })) };
  }

  const send = (res: http.ServerResponse, status: number, body: string | object, cacheState?: string) => {
    res.writeHead(status, { "content-type": "application/json", ...(cacheState ? { "x-cache": cacheState } : {}) });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  };
  const bad = (res: http.ServerResponse, message: string) => send(res, 400, { error: { code: "VALIDATION", message } });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    try {
      if (url.pathname === "/health") return send(res, 200, { ok: true });
      const tenant = apiKeys[String(req.headers["x-api-key"] ?? "")];
      if (!tenant) return send(res, 401, { error: { code: "INVALID_API_KEY" } });
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      if (!["/v1/stats/daily", "/v1/funnel"].includes(url.pathname)) return send(res, 404, { error: { code: "NOT_FOUND" } });
      if (!isDay(from) || !isDay(to)) return bad(res, "from ו־to בפורמט YYYY-MM-DD");
      if (daysBetween(from, to) < 0 || daysBetween(from, to) > 92) return bad(res, "טווח של 0 עד 92 ימים");

      let key: string;
      let compute: () => Promise<object>;
      if (url.pathname === "/v1/stats/daily") {
        const name = url.searchParams.get("name");
        if (name !== null && !NAME.test(name)) return bad(res, "name לא תקין");
        key = `${tenant}|daily|${from}|${to}|${name}`;
        compute = () => daily(tenant, from, to, name);
      } else {
        const steps = (url.searchParams.get("steps") ?? "").split(",").filter(Boolean);
        if (steps.length < 2 || steps.length > 5 || !steps.every((s) => NAME.test(s))) return bad(res, "steps: 2 עד 5 שמות אירועים");
        key = `${tenant}|funnel|${from}|${to}|${steps.join(",")}`; // ה־tenant חלק מהמפתח — בלי דליפה בין לקוחות דרך ה־cache
        compute = () => funnel(tenant, steps, from, to);
      }
      const hit = cache.get(key);
      if (hit && hit.expires > now()) return send(res, 200, hit.body, "HIT");
      const body = JSON.stringify(await compute());
      cache.set(key, { body, expires: now() + cacheTtlMs });
      send(res, 200, body, "MISS");
    } catch {
      send(res, 500, { error: { code: "INTERNAL" } });
    }
  });
  server.on("close", () => {
    conn.closeSync();
    duck.closeSync();
  });
  return server;
}
