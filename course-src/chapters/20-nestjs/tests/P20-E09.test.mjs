import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ProductsModule } = loadNest(import.meta.url, "P20-E09.ts");

test("PATCH ו־DELETE", async (t) => {
  const { call } = await nestApp(t, ProductsModule, { validation: true });
  await call("POST", "/products", { name: "Mug", price: 19.9, stock: 3 });
  let res = await call("PATCH", "/products/1", { price: 17.5 });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, name: "Mug", price: 17.5, stock: 3 });
  res = await call("PATCH", "/products/1", { stock: -1 });
  assert.equal(res.status, 400, "PartialType שומר על החוקים");
  assert.equal((await call("PATCH", "/products/1", { color: "red" })).status, 400, "שדה לא מוכר");
  assert.equal((await call("PATCH", "/products/9", { price: 1 })).status, 404);
  res = await call("DELETE", "/products/1");
  assert.equal(res.status, 204);
  assert.equal((await call("GET", "/products/1")).status, 404);
  assert.equal((await call("DELETE", "/products/1")).status, 404);
});
