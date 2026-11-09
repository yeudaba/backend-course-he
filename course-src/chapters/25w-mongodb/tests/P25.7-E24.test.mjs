import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { dashboard } = await load(import.meta.url, "P25.7-E24.ts");

test("סוף אוקטובר עד 3.11 (שעון ישראל)", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const r = await dashboard(db, new Date("2026-10-25T00:00:00+03:00"), new Date("2026-11-04T00:00:00+02:00"));
  assert.deepEqual(r.byDay, [
    { day: "2026-10-25", revenue: 140, orders: 1 },
    { day: "2026-10-28", revenue: 110, orders: 1 },
    { day: "2026-11-02", revenue: 144, orders: 1 },
    { day: "2026-11-03", revenue: 100, orders: 1 },
  ], "o9 (22:10Z ב־1.11) הוא 2.11 בישראל");
  assert.deepEqual(r.byStatus, { delivered: 2, pending: 2 });
  assert.deepEqual(r.topProducts, [{ productId: "p8", units: 4 }, { productId: "p4", units: 2 }, { productId: "p1", units: 1 }]);
});
test("כל אוקטובר: בלי ביטולים בהכנסות, אבל בספירת הסטטוסים", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const r = await dashboard(db, new Date("2026-10-01T00:00:00+03:00"), new Date("2026-11-01T00:00:00+02:00"));
  assert.deepEqual(r.byStatus, { cancelled: 1, delivered: 4, paid: 2, pending: 1 });
  assert.deepEqual(r.byDay.map((d) => d.day), ["2026-10-02", "2026-10-05", "2026-10-11", "2026-10-14", "2026-10-22", "2026-10-25", "2026-10-28"], "o6 (21:55Z ב־21.10) נספרת ב־22.10");
  assert.equal(r.byDay.reduce((s, d) => s + d.revenue, 0), 213 + 144 + 249 + 132 + 146 + 140 + 110);
});
test("טווח ריק", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await dashboard(db, new Date("2020-01-01"), new Date("2020-02-01")), { byDay: [], byStatus: {}, topProducts: [] });
});
