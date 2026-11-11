import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E64.ts";
const sample = () => [
  { id: 1, status: "pending" },
  { id: 2, status: "paid" },
  { id: 3, status: "shipped" },
  { id: 4, status: "cancelled", cancelledAt: "2026-01-01T00:00:00.000Z", cancelReason: "ישן" },
];
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("ביטול של pending ו־paid", async (t) => {
  const orders = sample();
  const call = await startApp(t, import.meta.url, FILE, orders);
  let r = await call("POST", "/orders/1/cancel", { reason: "הזמנתי בטעות" });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "cancelled");
  assert.equal(r.body.cancelReason, "הזמנתי בטעות");
  assert.ok(Math.abs(Date.parse(r.body.cancelledAt) - Date.now()) < 5000, "cancelledAt — עכשיו, ISO");
  assert.equal(orders[0].status, "cancelled", "המערך שהועבר משתנה במקום");
  r = await call("POST", "/orders/2/cancel");
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "cancelled");
  assert.equal(r.body.cancelReason, null, "בלי reason ← null");
  assert.deepEqual((await call("GET", "/orders/2")).body, r.body);
});
test("ביטול כפול ← 200 בלי שינוי", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, sample());
  let r = await call("POST", "/orders/4/cancel", { reason: "חדש" });
  assert.deepEqual([r.status, r.body], [200, sample()[3]]);
  const first = (await call("POST", "/orders/1/cancel")).body;
  await new Promise((res) => setTimeout(res, 15));
  r = await call("POST", "/orders/1/cancel", { reason: "שוב" });
  assert.deepEqual(r.body, first, "cancelledAt ו־cancelReason לא משתנים");
});
test("נשלחה ← 409, לא קיימת ← 404", async (t) => {
  const orders = sample();
  const call = await startApp(t, import.meta.url, FILE, orders);
  let r = await call("POST", "/orders/3/cancel");
  assert.deepEqual([r.status, r.body], [409, { error: { code: "ORDER_SHIPPED", message: "אי אפשר לבטל הזמנה שנשלחה" } }]);
  assert.equal(orders[2].status, "shipped");
  r = await call("POST", "/orders/99/cancel");
  assert.equal(r.status, 404);
  assert.equal(r.body?.error?.code, "ORDER_NOT_FOUND");
  r = await call("GET", "/orders/99");
  assert.equal(r.status, 404);
  assert.equal(r.body?.error?.code, "ORDER_NOT_FOUND");
});
