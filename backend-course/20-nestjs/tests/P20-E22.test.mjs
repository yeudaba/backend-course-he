import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { OrdersModule } = loadNest(import.meta.url, "P20-E22.ts");

test("הזמנה קיימת", async (t) => {
  const { call } = await nestApp(t, OrdersModule);
  assert.deepEqual((await call("GET", "/orders/1")).body, { id: 1, item: "Espresso cup" });
});
test("הזמנה שלא קיימת ← 404 במבנה שלנו", async (t) => {
  const { call } = await nestApp(t, OrdersModule);
  const res = await call("GET", "/orders/9");
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { code: "NOT_FOUND", message: "הזמנה 9 לא נמצאה" } });
});
test("id לא תקין ← 400 במבנה שלנו", async (t) => {
  const { call } = await nestApp(t, OrdersModule);
  const res = await call("GET", "/orders/abc");
  assert.equal(res.status, 400);
  assert.equal(res.body.error?.code, "BAD_REQUEST");
});
