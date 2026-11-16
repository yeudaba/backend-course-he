import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { latencyBudget } = await load(import.meta.url, "P28-E35.ts");

test("הבקשה מ־E31", () => {
  const r = latencyBudget([
    { name: "redis", ms: 0.5, count: 3 },
    { name: "db", ms: 1, count: 2 },
    { name: "loop", ms: 1 },
    { name: "payments-us", ms: 150 },
  ]);
  assert.deepEqual(r, { totalMs: 154.5, slowest: "payments-us", slowestShare: 97 });
});
test("count משנה את התמונה (N+1)", () => {
  const r = latencyBudget([{ name: "api", ms: 20 }, { name: "redis", ms: 0.5, count: 200 }]);
  assert.deepEqual(r, { totalMs: 120, slowest: "redis", slowestShare: 83 });
});
test("תיקו — הראשון; עיגול ל־2 ספרות", () => {
  assert.deepEqual(latencyBudget([{ name: "a", ms: 1 / 3 }, { name: "b", ms: 1 / 3 }]), { totalMs: 0.67, slowest: "a", slowestShare: 50 });
});
test("ריק או אפס", () => {
  const zero = { totalMs: 0, slowest: null, slowestShare: 0 };
  assert.deepEqual(latencyBudget([]), zero);
  assert.deepEqual(latencyBudget([{ name: "x", ms: 0 }]), zero);
});
