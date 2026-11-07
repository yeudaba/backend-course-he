import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E07.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
const products = [{ id: 1, name: "מקלדת", price: 249 }, { id: 2, name: "עכבר", price: 89 }, { id: 3, name: "כבל", price: 20 }];

test("רשימה וסינון", async (t) => {
  const call = await start(t, createApp(products));
  assert.deepEqual((await call("GET", "/products")).body, products);
  assert.deepEqual((await call("GET", "/products?maxPrice=89")).body.map((p) => p.id), [2, 3]);
});
test("מוצר אחד", async (t) => {
  const call = await start(t, createApp(products));
  assert.deepEqual((await call("GET", "/products/2")).body, products[1]);
  const res = await call("GET", "/products/9");
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { code: "NOT_FOUND", message: "המוצר לא נמצא" } });
});
