import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { slowPageChance, maxCalls } = await load(import.meta.url, "P28.5-E35.ts");

test("slowPageChance", () => {
  assert.equal(slowPageChance(0.01, 30), 0.2603);
  assert.equal(slowPageChance(0.01, 100), 0.634);
  assert.equal(slowPageChance(0.01, 1), 0.01);
  assert.equal(slowPageChance(0.05, 0), 0);
  assert.equal(slowPageChance(0.001, 30), 0.0296);
});
test("maxCalls", () => {
  assert.equal(maxCalls(0.01, 0.05), 5);
  assert.equal(maxCalls(0.001, 0.05), 51);
  assert.equal(maxCalls(0.01, 0.0101), 1);
  assert.equal(maxCalls(0.2, 0.1), 0);
});
test("slowRate לא תקין", () => {
  for (const bad of [0, 1, -0.1, 2]) {
    assert.throws(() => slowPageChance(bad, 3), RangeError);
    assert.throws(() => maxCalls(bad, 0.5), RangeError);
  }
});
