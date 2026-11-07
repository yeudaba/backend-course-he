import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { chunk, getPage, totalPages } = await load(import.meta.url, "P06-E19.js");

test("chunk", () => { assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]); assert.deepEqual(chunk([1, 2], 5), [[1, 2]]); assert.deepEqual(chunk([], 3), []); });
test("getPage", () => {
  const a = ["a", "b", "c", "d", "e"];
  assert.deepEqual(getPage(a, 1, 2), ["a", "b"]);
  assert.deepEqual(getPage(a, 3, 2), ["e"]);
  assert.deepEqual(getPage(a, 4, 2), []);
  assert.deepEqual(getPage(a, 0, 2), []);
});
test("totalPages", () => { assert.equal(totalPages(23, 10), 3); assert.equal(totalPages(20, 10), 2); assert.equal(totalPages(0, 10), 1); });
