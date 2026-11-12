import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { canFulfill } = await load(import.meta.url, "P27-E36.ts");

test("כמויות", () => {
  assert.equal(canFulfill(["latte", "latte", "mocha"], ["mocha", "latte", "tea", "latte"]), true);
  assert.equal(canFulfill(["latte", "latte"], ["latte", "mocha"]), false);
  assert.equal(canFulfill([], []), true);
  assert.equal(canFulfill(["x"], []), false);
});
test("300,000 — מהר", () => {
  const stock = Array.from({ length: 300_000 }, (_, i) => `p${i % 1000}`);
  const order = Array.from({ length: 300_000 }, (_, i) => `p${(i * 7) % 1000}`);
  assert.equal(fastEnough(() => canFulfill(order, stock), 300, "canFulfill"), true);
  order.push("p1");
  assert.equal(fastEnough(() => canFulfill(order, stock), 300, "canFulfill"), false);
});
