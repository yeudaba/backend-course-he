import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { collisionChance, codeLengthFor } = await load(import.meta.url, "P28-E62.ts");

test("collisionChance", () => {
  assert.ok(Math.abs(collisionChance(2e9, 7) - 0.000568) < 0.000001);
  assert.ok(Math.abs(collisionChance(1e8, 5) - 0.1092) < 0.0001);
  assert.equal(collisionChance(0, 3), 0);
  assert.equal(collisionChance(1e9, 2), 1, "לכל היותר 1");
});
test("codeLengthFor", () => {
  assert.equal(codeLengthFor(2e9, 0.001), 7);
  assert.equal(codeLengthFor(2e9, 0.0001), 8);
  assert.equal(codeLengthFor(1e8, 0.2), 5);
  assert.equal(codeLengthFor(1e8, 0.01), 6);
  assert.equal(codeLengthFor(0, 0.5), 1, "לפחות תו אחד");
  assert.equal(codeLengthFor(62, 1), 1);
  assert.equal(codeLengthFor(63, 1), 1);
  assert.equal(codeLengthFor(31, 0.5), 1);
  assert.equal(codeLengthFor(32, 0.5), 2);
});
test("maxChance לא תקין", () => {
  for (const bad of [0, -0.1, 1.5, NaN]) assert.throws(() => codeLengthFor(100, bad), RangeError, String(bad));
});
