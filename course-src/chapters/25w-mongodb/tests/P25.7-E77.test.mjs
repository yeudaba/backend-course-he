import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E77.ts", ["revenueByDay"])).revenueByDay;
const range = { from: new Date("2026-10-20T00:00:00Z"), to: new Date("2026-11-02T00:00:00Z") };

test("UTC מול ישראל", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, { timezone: "UTC", ...range }), [
    { day: "2026-10-21", orders: 1, revenue: 146 }, { day: "2026-10-25", orders: 1, revenue: 140 },
    { day: "2026-10-28", orders: 1, revenue: 110 }, { day: "2026-11-01", orders: 1, revenue: 144 },
  ]);
  assert.deepEqual((await f(db, { timezone: "Asia/Jerusalem", ...range })).map((r) => r.day), ["2026-10-22", "2026-10-25", "2026-10-28", "2026-11-02"]);
});
test("טווח חצי־פתוח, וביטולים", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await db.collection("orders").insertMany([
    { _id: "x1", status: "paid", total: 10, createdAt: new Date("2026-11-02T00:00:00Z") },
    { _id: "x2", status: "paid", total: 20, createdAt: new Date("2026-10-20T00:00:00Z") },
    { _id: "x3", status: "paid", total: 30, createdAt: new Date("2026-10-20T05:00:00Z") },
  ]);
  const r = await f(db, { timezone: "UTC", ...range });
  assert.deepEqual(r[0], { day: "2026-10-20", orders: 2, revenue: 50 }, "from כולל");
  assert.ok(!r.some((x) => x.day === "2026-11-02"), "to לא כולל");
  assert.ok(!r.some((x) => x.day === "2026-10-18"), "o5 בוטלה");
});
