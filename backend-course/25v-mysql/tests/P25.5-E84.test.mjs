import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

async function start(t) {
  const { productsRouter } = await exportsOf(import.meta.url, "P25.5-E84.ts", ["productsRouter"]);
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const app = express();
  app.use(productsRouter(plainPool(t, db)));
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("דפדוף", async (t) => {
  const call = await start(t);
  const a = await call("GET", "/products?limit=4");
  assert.deepEqual(a.body, { items: [
    { id: 1, name: "Ethiopia Beans 1kg", priceCents: 8990 }, { id: 2, name: "Colombia Beans 1kg", priceCents: 8490 },
    { id: 3, name: "Brazil Beans 250g", priceCents: 2990 }, { id: 4, name: "Hand Grinder", priceCents: 18900 },
  ], nextAfter: 4 });
  const b = await call("GET", "/products?limit=4&after=4");
  assert.deepEqual(b.body.items.map((p) => p.id), [5, 6, 7, 8]);
  const c = await call("GET", "/products?limit=4&after=8");
  assert.deepEqual([c.body.items.map((p) => p.id), c.body.nextAfter], [[9, 11], null], "מוצר 10 לא פעיל");
  assert.equal((await call("GET", "/products")).body.items.length, 10, "ברירת מחדל 10");
});
test("קטגוריה ושגיאות", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/products?category=brewing&limit=2&after=6");
  assert.deepEqual([r.body.items.map((p) => p.id), r.body.nextAfter], [[7, 8], 8]);
  assert.deepEqual((await call("GET", "/products?category=nope")).body, { items: [], nextAfter: null });
  for (const q of ["limit=0", "limit=51", "limit=abc", "after=-1", "after=1.5", "limit=5&limit=6"]) {
    const x = await call("GET", "/products?" + q);
    assert.deepEqual([x.status, x.body?.error?.code], [400, "VALIDATION_ERROR"], q);
  }
});
