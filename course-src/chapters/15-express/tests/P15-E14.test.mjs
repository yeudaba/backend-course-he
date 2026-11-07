import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E14.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
const products = [
  { id: 3, name: "Mouse", price: 89 },
  { id: 1, name: "Keyboard", price: 249 },
  { id: 2, name: "Cable", price: 20 },
  { id: 4, name: "Monitor", price: 899 },
];
const ids = (r) => r.body.map((p) => p.id);

test("סינון ומיון", async (t) => {
  const call = await start(t, createApp(products));
  assert.deepEqual(ids(await call("GET", "/products")), [1, 2, 3, 4]);
  assert.deepEqual(ids(await call("GET", "/products?q=mo")), [3, 4]);
  assert.deepEqual(ids(await call("GET", "/products?minPrice=50&maxPrice=300&sort=-price")), [1, 3]);
  assert.deepEqual(ids(await call("GET", "/products?sort=price")), [2, 3, 1, 4]);
  assert.deepEqual(ids(await call("GET", "/products?sort=name")), [2, 1, 4, 3]);
  assert.deepEqual(ids(await call("GET", "/products?sort=-name")), [3, 4, 1, 2]);
  assert.deepEqual(products.map((p) => p.id), [3, 1, 2, 4], "אסור לשנות את המערך המקורי");
});
test("קלט לא תקין", async (t) => {
  const call = await start(t, createApp(products));
  for (const q of ["minPrice=-1", "maxPrice=abc", "sort=date"]) {
    const res = await call("GET", "/products?" + q);
    assert.equal(res.status, 400, q);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  }
  const res = await call("GET", "/products?minPrice=500&maxPrice=100");
  assert.equal(res.status, 400);
  assert.equal(res.body.error.details[0].path, "minPrice");
});
