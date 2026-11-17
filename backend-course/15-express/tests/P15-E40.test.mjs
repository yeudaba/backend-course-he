import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E40.ts";
const data = () => [
  { sku: "PEN-1", name: "עט", price: 450 },
  { sku: "cup-2", name: "כוס", price: 1990 },
  { sku: "Bag-3", name: "תיק", price: 12900 },
];
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("מוצר אחד, בלי תלות באותיות", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, data());
  assert.deepEqual((await call("GET", "/products/by-sku/pen-1")).body, data()[0]);
  assert.deepEqual((await call("GET", "/products/by-sku/CUP-2")).body, data()[1]);
  assert.deepEqual((await call("GET", "/products/by-sku/bag-3")).body, data()[2]);
  const r = await call("GET", "/products/by-sku/Nope-9");
  assert.deepEqual([r.status, r.body], [404, { error: "לא נמצא: Nope-9" }]);
});
test("כמה מוצרים", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, data());
  let r = await call("GET", "/products/by-sku?skus=cup-2,%20PEN-1%20,nope,Cup-2,,NOPE,bag-3");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { found: [data()[1], data()[0], data()[2]], missing: ["nope"] }, "לפי הסדר, בלי כפילויות (גם באותיות שונות)");
  r = await call("GET", "/products/by-sku?skus=x");
  assert.deepEqual(r.body, { found: [], missing: ["x"] });
});
test("בלי skus ← 400", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, data());
  for (const q of ["", "?skus=", "?skus=,%20,"]) {
    const r = await call("GET", "/products/by-sku" + q);
    assert.deepEqual([r.status, r.body], [400, { error: "חסר skus" }], q || "(בלי query)");
  }
});
