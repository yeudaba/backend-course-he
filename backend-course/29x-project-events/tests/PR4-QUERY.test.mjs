import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import { loadP, eventsDb, listen } from "./_events.mjs";

// פרויקט 4, שלב 3: API השאילתות — MySQL לסטטיסטיקה, lake למשפכים
const { createQueryServer } = await loadP(import.meta.url, "src/query.ts");
const apiKeys = { "acme-key-0123456789": "acme", "globex-key-0123456789": "globex" };
const A = { "x-api-key": "acme-key-0123456789" };
const G = { "x-api-key": "globex-key-0123456789" };

// משפך של acme ב־1–2.11: u1 עשה הכול; u2 הוסיף לעגלה *לפני* הצפייה (לא נספר); u3 צפה בלבד; u4 צפה והוסיף
const lakeRows = [
  ["acme", "u1", "page_view", "2026-11-01 08:00:00"], ["acme", "u1", "add_to_cart", "2026-11-01 08:05:00"], ["acme", "u1", "purchase", "2026-11-01 08:10:00"],
  ["acme", "u2", "add_to_cart", "2026-11-01 09:00:00"], ["acme", "u2", "page_view", "2026-11-01 09:05:00"],
  ["acme", "u3", "page_view", "2026-11-02 10:00:00"],
  ["acme", "u4", "page_view", "2026-11-02 11:00:00"], ["acme", "u4", "add_to_cart", "2026-11-02 11:30:00"],
  ["acme", "u5", "page_view", "2026-11-04 11:00:00"], ["acme", "u5", "add_to_cart", "2026-11-04 11:30:00"], // מחוץ לטווח
  ["globex", "g1", "page_view", "2026-11-01 08:00:00"], ["globex", "g1", "add_to_cart", "2026-11-01 08:01:00"], ["globex", "g1", "purchase", "2026-11-01 08:02:00"],
];

async function setup(t, opts = {}) {
  const db = await eventsDb(t, import.meta.url);
  await db.query(`INSERT INTO daily_counts (tenant_id, day, name, events) VALUES
    ('acme','2026-11-01','page_view',120), ('acme','2026-11-01','purchase',7), ('acme','2026-11-02','page_view',80),
    ('acme','2026-11-03','page_view',95), ('acme','2026-10-31','page_view',300), ('globex','2026-11-01','page_view',999)`);
  for (const [d, n] of [["2026-11-01", 40], ["2026-11-02", 25], ["2026-11-03", 30]]) {
    for (let i = 0; i < n; i++) await db.query("INSERT INTO user_days VALUES ('acme', ?, ?)", [d, `u${i}`]);
  }
  await db.query("INSERT INTO user_days VALUES ('globex', '2026-11-01', 'g1')");
  const lakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "pr4-q-"));
  const duck = await DuckDBInstance.create(":memory:");
  const c = await duck.connect();
  await c.run(`CREATE TABLE t (id BIGINT, tenant_id VARCHAR, event_id VARCHAR, name VARCHAR, user_id VARCHAR, ts TIMESTAMP, day DATE, props VARCHAR)`);
  for (const [i, [tenant, user, name, ts]] of lakeRows.entries()) await c.run(`INSERT INTO t VALUES (${i + 1}, '${tenant}', uuid()::VARCHAR, '${name}', '${user}', TIMESTAMP '${ts}', DATE '${ts.slice(0, 10)}', NULL)`);
  await c.run(`COPY t TO '${path.join(lakeDir, "part-00001.parquet")}' (FORMAT parquet)`);
  c.closeSync();
  duck.closeSync();
  t.after(() => fs.rmSync(lakeDir, { recursive: true, force: true }));
  const call = await listen(t, await createQueryServer({ pool: db.pool(), lakeDir, apiKeys, ...opts }));
  return { call };
}

test("/v1/stats/daily: אירועים ומשתמשים לכל יום, רק של ה־tenant", async (t) => {
  const { call } = await setup(t);
  const r = await call("GET", "/v1/stats/daily?from=2026-11-01&to=2026-11-03", undefined, A);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.deepEqual(r.body.days, [
    { day: "2026-11-01", events: 127, users: 40 },
    { day: "2026-11-02", events: 80, users: 25 },
    { day: "2026-11-03", events: 95, users: 30 },
  ]);
  const p = await call("GET", "/v1/stats/daily?from=2026-11-01&to=2026-11-03&name=purchase", undefined, A);
  assert.deepEqual(p.body.days.map((d) => [d.day, d.events]), [["2026-11-01", 7]]);
  const g = await call("GET", "/v1/stats/daily?from=2026-11-01&to=2026-11-01", undefined, G);
  assert.deepEqual(g.body.days, [{ day: "2026-11-01", events: 999, users: 1 }]);
});
test("/v1/funnel: כל שלב אחרי הקודם, בטווח, ל־tenant", async (t) => {
  const { call } = await setup(t);
  const r = await call("GET", "/v1/funnel?steps=page_view,add_to_cart,purchase&from=2026-11-01&to=2026-11-02", undefined, A);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.deepEqual(r.body.steps, [{ name: "page_view", users: 4 }, { name: "add_to_cart", users: 2 }, { name: "purchase", users: 1 }]);
  const g = await call("GET", "/v1/funnel?steps=page_view,purchase&from=2026-11-01&to=2026-11-02", undefined, G);
  assert.deepEqual(g.body.steps, [{ name: "page_view", users: 1 }, { name: "purchase", users: 1 }]);
});
test("אימות ו־400", async (t) => {
  const { call } = await setup(t);
  assert.equal((await call("GET", "/v1/stats/daily?from=2026-11-01&to=2026-11-03")).status, 401);
  for (const p of [
    "/v1/stats/daily?from=2026-11-01",
    "/v1/stats/daily?from=2026-11-05&to=2026-11-01",
    "/v1/stats/daily?from=2026-01-01&to=2026-12-31",
    "/v1/stats/daily?from=2026-11-01&to=2026-11-03&name=x';--",
    "/v1/funnel?steps=page_view&from=2026-11-01&to=2026-11-02",
    "/v1/funnel?steps=a,b,c,d,e,f&from=2026-11-01&to=2026-11-02",
  ]) assert.equal((await call("GET", p, undefined, A)).status, 400, p);
});
test("cache: אותה שאלה ← HIT; tenant אחר — לא מקבל את התשובה של הראשון", async (t) => {
  let now = 1_000_000;
  const { call } = await setup(t, { cacheTtlMs: 5000, now: () => now });
  const q = "/v1/stats/daily?from=2026-11-01&to=2026-11-01";
  assert.equal((await call("GET", q, undefined, A)).headers.get("x-cache"), "MISS");
  assert.equal((await call("GET", q, undefined, A)).headers.get("x-cache"), "HIT");
  const g = await call("GET", q, undefined, G);
  assert.equal(g.body.days[0].events, 999, "ה־cache חייב לכלול את ה־tenant במפתח");
  now += 6000;
  assert.equal((await call("GET", q, undefined, A)).headers.get("x-cache"), "MISS");
});
