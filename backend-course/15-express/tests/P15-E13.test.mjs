import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { paginate, createApp } = await load(import.meta.url, "P15-E13.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
const items = Array.from({ length: 57 }, (_, i) => i + 1);

test("paginate", () => {
  const r = paginate(items, 3, 20);
  assert.deepEqual(r.meta, { page: 3, limit: 20, total: 57, totalPages: 3 });
  assert.deepEqual(r.data, items.slice(40));
  assert.deepEqual(paginate([], 1, 10), { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  assert.deepEqual(paginate(items, 9, 10).data, []);
});
test("route", async (t) => {
  const call = await start(t, createApp(items));
  let res = await call("GET", "/products");
  assert.deepEqual(res.body.meta, { page: 1, limit: 10, total: 57, totalPages: 6 });
  assert.deepEqual(res.body.data, items.slice(0, 10));
  res = await call("GET", "/products?page=2&limit=25");
  assert.deepEqual(res.body.data, items.slice(25, 50));
  res = await call("GET", "/products?page=99");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data, []);
  for (const q of ["page=0", "limit=51", "page=abc"]) {
    res = await call("GET", "/products?" + q);
    assert.equal(res.status, 400, q);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
    assert.equal(res.body.error.message, "קלט לא תקין");
    assert.equal(res.body.error.details[0].path, q.split("=")[0]);
  }
});
