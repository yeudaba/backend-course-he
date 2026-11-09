import { test } from "node:test";
import assert from "node:assert/strict";
import { duck } from "./_duck.mjs";

test("זהה לפתרון (יום בישראל, לקוחות שונים, כמות × מחיר)", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E22.sql");
  const want = await d.expectedRows("P28.5-E22.sql");
  assert.equal(got[0]?.day, want[0].day);
  assert.deepEqual(got.map((r) => r.day), want.map((r) => r.day), "באג 1: היום נחתך ב־UTC במקום בשעון ישראל");
  assert.deepEqual(got.map((r) => r.active_customers), want.map((r) => r.active_customers), "באג 2: סופרים הזמנות, לא לקוחות שונים");
  assert.deepEqual(got.map((r) => r.revenue), want.map((r) => r.revenue), "באג 3: ההכנסה לא כוללת כמות");
});
