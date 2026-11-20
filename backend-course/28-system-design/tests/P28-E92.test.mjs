import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { poolBudget } = await load(import.meta.url, "P28-E92.ts");

test("חנות הקפה: 3 × 10", () => {
  assert.deepEqual(poolBudget({ instances: 3, poolPerInstance: 10, maxConnections: 100 }), { total: 30, available: 97, ok: true, maxPoolPerInstance: 32 });
});
test("מעגלים למטה (שבר של חיבור לא קיים)", () => {
  assert.equal(poolBudget({ instances: 3, poolPerInstance: 10, maxConnections: 101 }).maxPoolPerInstance, 32, "98 / 3 = 32.67 ← 32");
});
test("עם workers, ובגבול", () => {
  assert.deepEqual(poolBudget({ instances: 5, poolPerInstance: 10, workers: 2, poolPerWorker: 5, maxConnections: 60 }), { total: 60, available: 57, ok: false, maxPoolPerInstance: 9 });
  assert.deepEqual(poolBudget({ instances: 2, poolPerInstance: 8, maxConnections: 20, reserved: 4 }), { total: 16, available: 16, ok: true, maxPoolPerInstance: 8 });
  assert.equal(poolBudget({ instances: 2, poolPerInstance: 1, workers: 10, poolPerWorker: 5, maxConnections: 20 }).maxPoolPerInstance, 0);
});
