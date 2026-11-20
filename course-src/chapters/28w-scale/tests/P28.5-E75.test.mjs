import { test } from "node:test";
import assert from "node:assert/strict";
import { duck, sameAsSolution } from "./_duck.mjs";

test("מדינות — זהה לפתרון", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E75.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), ["country", "orders", "customers", "avg_order", "rank"]);
  await sameAsSolution("P28.5-E75.sql");
});
test("שפיות", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E75.sql");
  assert.equal(got.reduce((s, r) => s + Number(r.orders), 0), 60000);
  assert.equal(got[0].country, "IL");
  assert.deepEqual(got.map((r) => Number(r.rank)), got.map((_, i) => i + 1));
  for (const r of got) assert.ok(Number(r.customers) < Number(r.orders), "customers — לקוחות שונים");
});
