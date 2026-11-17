import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createStore, naiveBuy, safeBuy, simulate } = await load(import.meta.url, "P30-E80.ts");

test("החנות עצמה", async () => {
  const s = createStore(2, 20);
  assert.equal(await s.read(), 2);
  await s.write(5);
  assert.equal(await s.read(), 5);
  const t0 = Date.now();
  await s.read();
  assert.ok(Date.now() - t0 >= 15, "כל פעולה מחכה delayMs");
  const one = createStore(1, 2);
  const r = await Promise.all([one.decrementIfAvailable(), one.decrementIfAvailable(), one.decrementIfAvailable()]);
  assert.deepEqual(r.filter(Boolean).length, 1, "decrementIfAvailable אטומי");
  assert.equal(await one.read(), 0);
});
test("naive מוכר יותר מהמלאי; safe — בדיוק", async () => {
  const bad = await simulate(naiveBuy, 3, 20, 5);
  assert.ok(bad.sold > 3, `naive מכר ${bad.sold}`);
  assert.deepEqual(bad, { sold: 20, finalStock: 2 });
  assert.deepEqual(await simulate(safeBuy, 3, 20, 5), { sold: 3, finalStock: 0 });
  assert.deepEqual(await simulate(safeBuy, 0, 5, 1), { sold: 0, finalStock: 0 });
  assert.deepEqual(await simulate(naiveBuy, 3, 1, 1), { sold: 1, finalStock: 2 }, "בלי מקביליות — naive תקין");
});
