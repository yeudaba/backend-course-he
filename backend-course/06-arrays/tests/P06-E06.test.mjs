import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { lastItem, firstAndLast, safeGet } = await load(import.meta.url, "P06-E06.js");

test("lastItem", () => { assert.equal(lastItem([1, 2, 3]), 3); assert.equal(lastItem(["x"]), "x"); assert.equal(lastItem([]), undefined); });
test("firstAndLast", () => { assert.deepEqual(firstAndLast(["a", "b", "c"]), ["a", "c"]); assert.deepEqual(firstAndLast([7]), [7, 7]); assert.deepEqual(firstAndLast([]), []); });
test("safeGet", () => {
  assert.equal(safeGet([10, 20], 1), 20);
  assert.equal(safeGet([10, 20], 5, 0), 0);
  assert.equal(safeGet([10, 20], -1, "אין"), "אין");
  assert.equal(safeGet([10, 20], 2), null);
});
