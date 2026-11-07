import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { twoSumFast, groupAnagrams } = await load(import.meta.url, "P07-E25.js");

test("twoSumFast", () => {
  assert.deepEqual(twoSumFast([2, 7, 11, 15], 9), [0, 1]);
  assert.deepEqual(twoSumFast([3, 2, 4], 6), [1, 2]);
  assert.deepEqual(twoSumFast([3, 3], 6), [0, 1]);
  assert.equal(twoSumFast([1, 2], 10), null);
});
test("groupAnagrams", () => {
  assert.deepEqual(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]), [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]);
  assert.deepEqual(groupAnagrams([]), []);
});
