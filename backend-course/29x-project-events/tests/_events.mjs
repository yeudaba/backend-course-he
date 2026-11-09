// עוזרים משותפים לבודקים של פרויקט 4. הפרויקט שלך: npm run check PR4 -- --dir ~/dev/events-platform
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import { load, target } from "../../tools/load.mjs";
import { connectAdmin, mysqlUrl } from "../../tools/mysql.mjs";

export const P = (file) => `events-platform/${file}`;
export const loadP = (testUrl, file) => load(testUrl, P(file));
export const fileP = (testUrl, file) => target(testUrl, P(file));

// database חדש, עם ה־migrations שלך (events-platform/migrations/*.sql, לפי הסדר)
export async function eventsDb(t, testUrl) {
  const dir = path.dirname(fileP(testUrl, "migrations/x.sql"));
  if (!fs.existsSync(dir)) throw new Error(`אין תיקיית migrations (${dir}) — שלב 0: הסכמה`);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  if (!files.length) throw new Error("אין קובצי migration");
  const admin = await connectAdmin();
  const name = `pr4_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  const opts = { uri: mysqlUrl, database: name, multipleStatements: true, dateStrings: true };
  const conn = await mysql.createConnection(opts);
  for (const f of files) await conn.query(fs.readFileSync(path.join(dir, f), "utf8"));
  const pools = [];
  t.after(async () => {
    for (const p of pools) await p.end().catch(() => {});
    await conn.end().catch(() => {});
    await admin.query(`DROP DATABASE IF EXISTS \`${name}\``).catch(() => {});
    await admin.end();
  });
  return {
    name,
    rows: async (sql, params) => (await conn.query(sql, params))[0],
    query: (sql, params) => conn.query(sql, params),
    // pool עם dateStrings: true — כך כתוב בחוזה (שלב 0)
    pool(connectionLimit = 5) {
      const p = mysql.createPool({ ...opts, multipleStatements: false, connectionLimit });
      pools.push(p);
      return p;
    },
  };
}

// אירוע כמו שה־ingest כותב ל־Kafka
export const kafkaEvent = (over = {}) => ({
  tenantId: "acme",
  eventId: randomUUID(),
  name: "page_view",
  userId: "u1",
  ts: "2026-11-05T10:00:00.000Z",
  receivedAt: "2026-11-05T10:00:01.000Z",
  ...over,
});

export async function listen(t, server) {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(() => r())));
  const base = `http://127.0.0.1:${server.address().port}`;
  return async (method, p, body, headers = {}) => {
    const res = await fetch(base + p, { method, headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, body: json, headers: res.headers };
  };
}
