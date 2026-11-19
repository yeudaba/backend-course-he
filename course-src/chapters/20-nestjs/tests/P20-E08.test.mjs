import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ProductsModule } = loadNest(import.meta.url, "P20-E08.ts");

test("POST תקין ← 201", async (t) => {
  const { call } = await nestApp(t, ProductsModule, { validation: true });
  const res = await call("POST", "/products", { name: "Mug", price: 19.9, stock: 3 });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, name: "Mug", price: 19.9, stock: 3, isActive: true });
  assert.equal((await call("POST", "/products", { name: "Jug", price: 5, stock: 0, isActive: false })).body.id, 2);
  assert.equal((await call("GET", "/products")).body.length, 2);
});
test("ולידציה ← 400 עם רשימת הודעות", async (t) => {
  const { call } = await nestApp(t, ProductsModule, { validation: true });
  const res = await call("POST", "/products", { name: "X", price: 0, extra: 1 });
  assert.equal(res.status, 400);
  for (const m of ["property extra should not exist", "name must be longer than or equal to 2 characters", "price must not be less than 0.01", "stock must be an integer number"]) {
    assert.ok(res.body.message.includes(m), `חסרה ההודעה: ${m}`);
  }
  assert.equal((await call("POST", "/products", { name: "Mug", price: 1.234, stock: 1 })).status, 400, "יותר משתי ספרות אחרי הנקודה");
  assert.equal((await call("POST", "/products", { name: "Mug", price: 1, stock: 1, isActive: "yes" })).status, 400);
  assert.equal((await call("POST", "/products", { name: "Mug", price: 100_000.01, stock: 1 })).status, 400, "price מעל 100,000");
  assert.equal((await call("POST", "/products", { name: "M".repeat(81), price: 1, stock: 1 })).status, 400, "name באורך 81 — מעל 80");
  assert.equal((await call("GET", "/products")).body.length, 0, "שום מוצר לא נשמר");
  assert.equal((await call("POST", "/products", { name: "M".repeat(80), price: 100_000, stock: 0 })).status, 201, "name באורך 80 ו־price של 100,000 — מותרים (הגבולות עצמם)");
});
