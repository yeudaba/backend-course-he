import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { twoSum, mergeSorted } = await load(import.meta.url, "P06-E25.js");

test("twoSum", () => { assert.deepEqual(twoSum([2, 7, 11, 15], 9), [0, 1]); assert.deepEqual(twoSum([3, 2, 4], 6), [1, 2]); });
test("twoSum לא משתמש באותו איבר פעמיים", () => assert.deepEqual(twoSum([3, 3], 6), [0, 1]));
test("twoSum בלי פתרון → null", () => { assert.equal(twoSum([1, 2], 10), null); assert.equal(twoSum([5], 10), null); });
test("mergeSorted", () => {
  assert.deepEqual(mergeSorted([1, 4, 9], [2, 3, 10, 12]), [1, 2, 3, 4, 9, 10, 12]);
  assert.deepEqual(mergeSorted([], [1, 2]), [1, 2]);
  assert.deepEqual(mergeSorted([1, 1], [1]), [1, 1, 1]);
});
