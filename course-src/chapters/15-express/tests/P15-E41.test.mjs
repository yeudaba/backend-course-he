import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E41.ts";
const orders = () => [
  { id: 1, customer: "דנה", status: "paid", totalAgorot: 5000, createdAt: "2026-11-01T09:00:00Z" },
  { id: 2, customer: "יוסי", status: "shipped", totalAgorot: 13000, createdAt: "2026-11-02T10:00:00Z" },
  { id: 3, customer: "דנה", status: "paid", totalAgorot: 8000, createdAt: "2026-11-03T23:30:00Z" },
  { id: 4, customer: "רון", status: "cancelled", totalAgorot: 90000, createdAt: "2026-11-03T08:00:00Z" },
  { id: 5, customer: "מיכל", status: "shipped", totalAgorot: 700, createdAt: "2026-11-05T08:00:00Z" },
];
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("בלי סינון — שוויון בין דנה ליוסי ← דנה (הופיעה ראשונה)", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, orders());
  const r = await call("GET", "/stats");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { count: 5, byStatus: { paid: 2, shipped: 2, cancelled: 1 }, revenueAgorot: 26700, topCustomer: "דנה" });
});
test("from ו־to כוללים את הקצוות", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, orders());
  let r = await call("GET", "/stats?from=2026-11-02");
  assert.deepEqual(r.body, { count: 4, byStatus: { paid: 1, shipped: 2, cancelled: 1 }, revenueAgorot: 21700, topCustomer: "יוסי" }, "ביטול לא נספר — רון לא מוביל");
  r = await call("GET", "/stats?from=2026-11-03&to=2026-11-03");
  assert.deepEqual(r.body, { count: 2, byStatus: { paid: 1, shipped: 0, cancelled: 1 }, revenueAgorot: 8000, topCustomer: "דנה" }, "23:30Z עדיין 2026-11-03 לפי 10 התווים הראשונים");
  r = await call("GET", "/stats?to=2026-10-31");
  assert.deepEqual(r.body, { count: 0, byStatus: { paid: 0, shipped: 0, cancelled: 0 }, revenueAgorot: 0, topCustomer: null });
});
test("רק ביטולים ← topCustomer null", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, [orders()[3]]);
  assert.deepEqual((await call("GET", "/stats")).body, { count: 1, byStatus: { paid: 0, shipped: 0, cancelled: 1 }, revenueAgorot: 0, topCustomer: null });
});
test("תאריך לא תקין", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, orders());
  for (const q of ["?from=3.11.2026", "?to=2026-11-3", "?from=2026-11-01T00:00", "?from=", "?from=2026-11-01&from=2026-11-02", "?to=x2026-11-01"]) {
    const r = await call("GET", "/stats" + q);
    assert.deepEqual([r.status, r.body], [400, { error: "תאריך לא תקין" }], q);
  }
});
