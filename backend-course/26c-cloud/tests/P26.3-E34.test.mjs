import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { regionOf, spreadAcrossAzs, survivesAzLoss } = await load(import.meta.url, "P26.3-E34.ts");

test("regionOf", () => {
  assert.equal(regionOf("eu-central-1a"), "eu-central-1");
  assert.equal(regionOf("il-central-1c"), "il-central-1");
  assert.equal(regionOf("us-gov-west-1b"), "us-gov-west-1");
  for (const bad of ["eu-central-1", "eu-central-1ab", "EU-central-1a", "central-1a", ""]) assert.equal(regionOf(bad), null, bad);
});
test("spreadAcrossAzs", () => {
  assert.deepEqual(spreadAcrossAzs(5, ["a", "b", "c"]), { a: 2, b: 2, c: 1 });
  assert.deepEqual(spreadAcrossAzs(3, ["x", "y", "z"]), { x: 1, y: 1, z: 1 });
  assert.deepEqual(spreadAcrossAzs(1, ["x", "y", "z"]), { x: 1, y: 0, z: 0 }, "כל AZ מופיע, גם עם 0");
  assert.deepEqual(spreadAcrossAzs(0, ["x"]), { x: 0 });
  assert.throws(() => spreadAcrossAzs(3, []), RangeError);
});
test("survivesAzLoss", () => {
  assert.equal(survivesAzLoss({ a: 2, b: 2, c: 1 }, 3), true);
  assert.equal(survivesAzLoss({ a: 2, b: 2, c: 1 }, 4), false, "a נופל ← נשארים 3");
  assert.equal(survivesAzLoss({ a: 3, b: 0, c: 0 }, 1), false, "הכול ב־AZ אחד");
  assert.equal(survivesAzLoss({ a: 1, b: 1 }, 1), true);
});
