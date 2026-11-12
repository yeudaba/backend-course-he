import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { assignPartitions } = await load(import.meta.url, "P26.5-E82.ts");

test("range", () => {
  assert.deepEqual(assignPartitions(7, ["b", "a", "c"]), { a: [0, 1, 2], b: [3, 4], c: [5, 6] });
  assert.deepEqual(assignPartitions(4, ["x"]), { x: [0, 1, 2, 3] });
  assert.deepEqual(assignPartitions(6, ["c2", "c1"]), { c1: [0, 1, 2], c2: [3, 4, 5] });
  assert.deepEqual(assignPartitions(3, ["e", "d", "c", "b", "a"]), { a: [0], b: [1], c: [2], d: [], e: [] });
  assert.deepEqual(assignPartitions(5, []), {});
  assert.throws(() => assignPartitions(3, ["a", "a"]));
});
