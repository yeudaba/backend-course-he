import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf, code } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.5-E67.ts", ["recordView", "topProducts"]);

test("50 במקביל ← 50", async (t) => {
  const { recordView } = await get();
  const db = await mysqlSandbox(t, import.meta.url, "locks.sql");
  const pool = db.pool(10);
  await Promise.all(Array.from({ length: 50 }, () => recordView(pool, 7, "2026-11-05")));
  assert.deepEqual(await db.rows("SELECT product_id, day, views FROM product_views"), [{ product_id: 7, day: "2026-11-05", views: 50 }]);
});
test("topProducts", async (t) => {
  const { recordView, topProducts } = await get();
  const db = await mysqlSandbox(t, import.meta.url, "locks.sql");
  const pool = db.pool(5);
  const plan = { 1: 3, 2: 5, 3: 3, 4: 1 };
  for (const [p, n] of Object.entries(plan)) for (let i = 0; i < n; i++) await recordView(pool, Number(p), "2026-11-05");
  await recordView(pool, 9, "2026-11-04");
  assert.deepEqual(await topProducts(pool, "2026-11-05", 3), [{ productId: 2, views: 5 }, { productId: 1, views: 3 }, { productId: 3, views: 3 }]);
  assert.deepEqual(await topProducts(pool, "2026-11-04", 10), [{ productId: 9, views: 1 }]);
  assert.deepEqual(await topProducts(pool, "2026-01-01", 10), []);
  assert.doesNotMatch(code(import.meta.url, "P25.5-E67.ts"), /LIMIT\s*\$\{/, "limit כפרמטר, לא שרשור");
});
