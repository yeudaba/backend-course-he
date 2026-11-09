import { test } from "node:test";
import assert from "node:assert/strict";
import { duck } from "./_duck.mjs";

test("דוח קטגוריות — זהה לפתרון", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E15.sql");
  assert.deepEqual(got, await d.expectedRows("P28.5-E15.sql"));
});
test("שפיות: 4 קטגוריות, והאחוזים מסתכמים ל־100", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E15.sql");
  assert.deepEqual(got.map((r) => Object.keys(r)).at(0), ["category", "orders", "units", "revenue", "share_pct"]);
  assert.equal(got.length, 4);
  assert.equal(got.reduce((s, r) => s + Number(r.orders), 0), 60000);
  assert.ok(Math.abs(got.reduce((s, r) => s + Number(r.share_pct), 0) - 100) < 0.3);
});
