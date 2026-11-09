import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { load } from "../../tools/load.mjs";
import { duck, ordersParquet } from "./_duck.mjs";

const { createAnalyticsServer } = await load(import.meta.url, "P28.5-E24.ts");

async function start(t, opts = {}) {
  const s = await createAnalyticsServer({ parquetPath: ordersParquet, ...opts });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => s.close(r)));
  const base = `http://127.0.0.1:${s.address().port}`;
  return async (p) => {
    const res = await fetch(base + p);
    return { status: res.status, cache: res.headers.get("x-cache"), body: await res.json() };
  };
}

test("/revenue: לכל יום (שעון ישראל) — כמו החישוב ישירות על הקובץ", async (t) => {
  const d = await duck(t);
  const get = await start(t);
  const want = (await d.rows(`SELECT strftime(timezone('Asia/Jerusalem', created_at), '%Y-%m-%d') AS day, count(*)::INTEGER AS orders, round(sum(quantity * price_cents) / 100.0, 2)::DOUBLE AS revenue FROM orders GROUP BY day HAVING day BETWEEN '2026-10-30' AND '2026-11-02' ORDER BY day`)).map((r) => ({ day: r.day, orders: Number(r.orders), revenue: Number(r.revenue) }));
  const r = await get("/revenue?from=2026-10-30&to=2026-11-02");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.days, want);
  assert.deepEqual(r.body.total, { orders: want.reduce((s, x) => s + x.orders, 0), revenue: Math.round(want.reduce((s, x) => s + x.revenue * 100, 0)) / 100 });
  assert.equal(r.body.from, "2026-10-30");
});
test("/top-products", async (t) => {
  const get = await start(t);
  const r = await get("/top-products?day=2026-10-15&limit=3");
  assert.equal(r.status, 200);
  assert.equal(r.body.length, 3);
  assert.deepEqual(Object.keys(r.body[0]).sort(), ["product", "revenue", "units"]);
  assert.ok(r.body[0].revenue >= r.body[1].revenue && r.body[1].revenue >= r.body[2].revenue);
  assert.equal((await get("/top-products?day=2026-10-15")).body.length, 5);
});
test("קלט לא תקין ← 400", async (t) => {
  const get = await start(t);
  for (const p of ["/revenue?from=2026-10-01", "/revenue?from=2026-13-01&to=2026-10-02", "/revenue?from=2026-10-05&to=2026-10-01", "/revenue?from=2026-01-01&to=2026-12-31", "/revenue?from=2026-10-01'--&to=2026-10-02", "/top-products?day=2026-10-15&limit=500"]) {
    assert.equal((await get(p)).status, 400, p);
  }
  assert.equal((await get("/nope")).status, 404);
});
test("cache: אותה שאילתה ← HIT; אחרי ה־TTL ← שוב MISS", async (t) => {
  let now = 1_000_000;
  const get = await start(t, { cacheTtlMs: 5000, now: () => now });
  assert.equal((await get("/revenue?from=2026-10-01&to=2026-10-03")).cache, "MISS");
  const hit = await get("/revenue?from=2026-10-01&to=2026-10-03");
  assert.equal(hit.cache, "HIT");
  now += 6000;
  assert.equal((await get("/revenue?from=2026-10-01&to=2026-10-03")).cache, "MISS");
});
test("תחת עומס: 300 בקשות, 10 במקביל ← p95 מתחת ל־50ms", async (t) => {
  const get = await start(t);
  const paths = Array.from({ length: 10 }, (_, i) => `/revenue?from=2026-10-${String(i + 1).padStart(2, "0")}&to=2026-10-${String(i + 15).padStart(2, "0")}`);
  const lat = [];
  let next = 0;
  await Promise.all(Array.from({ length: 10 }, async () => {
    while (next < 300) {
      const p = paths[next++ % paths.length];
      const t0 = performance.now();
      const r = await get(p);
      lat.push(performance.now() - t0);
      assert.equal(r.status, 200);
    }
  }));
  lat.sort((a, b) => a - b);
  const p95 = lat[Math.ceil(0.95 * lat.length) - 1];
  assert.ok(p95 < 50, `p95 = ${p95.toFixed(1)}ms`);
});
