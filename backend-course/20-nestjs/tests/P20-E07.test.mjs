import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ProductsModule } = loadNest(import.meta.url, "P20-E07.ts");

test("רשימה ומוצר בודד", async (t) => {
  const { call } = await nestApp(t, ProductsModule);
  const list = await call("GET", "/products");
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 3, "שלושה מוצרים התחלתיים");
  const one = await call("GET", "/products/2");
  assert.equal(one.status, 200);
  assert.deepEqual(one.body, { id: 2, name: "Hand grinder", price: 189 });
});
test("404 ו־400", async (t) => {
  const { call } = await nestApp(t, ProductsModule);
  const missing = await call("GET", "/products/99");
  assert.equal(missing.status, 404);
  assert.equal(missing.body.message, "מוצר 99 לא נמצא");
  const bad = await call("GET", "/products/abc");
  assert.equal(bad.status, 400, "id שאינו מספר ← 400 מ־ParseIntPipe");
});
