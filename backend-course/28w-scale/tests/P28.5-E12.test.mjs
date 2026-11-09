import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { bulkInsertViews } = await load(import.meta.url, "P28.5-E12.ts");
const rows = (n, from = 0) => Array.from({ length: n }, (_, i) => ({ id: `v${from + i}`, userId: (i % 50) + 1, path: `/products/${i % 30}`, at: new Date(Date.UTC(2026, 10, 1, 0, 0, i)).toISOString() }));

function counting(pool) {
  let calls = 0;
  return { proxy: { query: (...a) => (calls++, pool.query(...a)), connect: () => pool.connect() }, calls: () => calls };
}

test("12,000 שורות ב־3 שאילתות (batch של 5000)", async (t) => {
  const db = await sandbox(t, import.meta.url, "views.sql");
  const { proxy, calls } = counting(db.pool(2));
  assert.equal(await bulkInsertViews(proxy, rows(12000)), 12000);
  assert.ok(calls() <= 3, `${calls()} שאילתות — שורה לכל INSERT זה 12,000 round trips`);
  assert.equal((await db.rows("SELECT count(*)::int n FROM page_views"))[0].n, 12000);
  const [r] = await db.rows("SELECT user_id, path, viewed_at FROM page_views WHERE id = 'v61'");
  assert.deepEqual(r, { user_id: 12, path: "/products/1", viewed_at: new Date(Date.UTC(2026, 10, 1, 0, 1, 1)) });
});
test("batchSize, ו־id קיים ← לא נכנס פעמיים", async (t) => {
  const db = await sandbox(t, import.meta.url, "views.sql");
  const { proxy, calls } = counting(db.pool(2));
  await bulkInsertViews(proxy, rows(100));
  assert.equal(await bulkInsertViews(proxy, rows(150, 50), { batchSize: 40 }), 100, "50 כבר קיימים");
  assert.equal(calls(), 1 + 4);
  assert.equal((await db.rows("SELECT count(*)::int n FROM page_views"))[0].n, 200);
});
test("ריק ← 0, בלי שאילתה", async (t) => {
  const db = await sandbox(t, import.meta.url, "views.sql");
  const { proxy, calls } = counting(db.pool(1));
  assert.equal(await bulkInsertViews(proxy, []), 0);
  assert.equal(calls(), 0);
});
