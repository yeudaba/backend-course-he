import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ProductsModule } = loadNest(import.meta.url, "P20-E10.ts");

test("pagination", async (t) => {
  const { call } = await nestApp(t, ProductsModule, { validation: true });
  let res = await call("GET", "/products");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.meta, { page: 1, limit: 10, total: 25, pages: 3 });
  assert.equal(res.body.data.length, 10);
  res = await call("GET", "/products?page=3&limit=10");
  assert.deepEqual(res.body.data.map((p) => p.id), [21, 22, 23, 24, 25]);
  assert.equal(res.body.meta.page, 3, "page הוא מספר, לא \"3\"");
  res = await call("GET", "/products?q=product%202&limit=3");
  assert.deepEqual(res.body.meta, { page: 1, limit: 3, total: 7, pages: 3 });
});
test("query לא תקין ← 400", async (t) => {
  const { call } = await nestApp(t, ProductsModule, { validation: true });
  for (const q of ["page=0", "limit=51", "page=abc", "limit=2.5"]) {
    assert.equal((await call("GET", "/products?" + q)).status, 400, q);
  }
});
