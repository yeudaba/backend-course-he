import { test } from "node:test";
import assert from "node:assert/strict";
import { duck } from "./_duck.mjs";

test("הכנסה יומית — זהה לפתרון", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E76.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), ["day", "revenue", "running", "vs_prev_pct"]);
  assert.deepEqual(got, await d.expectedRows("P28.5-E76.sql"));
});
test("שפיות: 31 ימים, NULL ביום הראשון, running = סכום", async (t) => {
  const d = await duck(t);
  const got = await d.fileRows("P28.5-E76.sql");
  assert.equal(got.length, 31);
  assert.equal(got[0].vs_prev_pct, null);
  assert.equal(got[0].running, got[0].revenue);
  const total = got.reduce((s, r) => s + Number(r.revenue), 0);
  assert.ok(Math.abs(total - Number(got.at(-1).running)) < 0.5);
});
