import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { totalPages, pageOf } = await load(import.meta.url, "P30-E97.ts");

test("totalPages — מקרי הגבול מהשיעור", () => {
  assert.equal(totalPages(100, 20), 5);
  assert.equal(totalPages(101, 20), 6);
  assert.equal(totalPages(5, 20), 1);
  assert.equal(totalPages(0, 20), 0);
  assert.equal(totalPages(1, 1), 1);
  assert.equal(totalPages(250, 100), 3);
});
test("pageOf", () => {
  assert.equal(pageOf(0, 20), 1);
  assert.equal(pageOf(19, 20), 1);
  assert.equal(pageOf(20, 20), 2);
  assert.equal(pageOf(100, 20), 6);
});
test("קלט לא תקין", () => {
  for (const [a, b] of [[-1, 20], [1.5, 20], [10, 0], [10, 101], [10, 2.5], [NaN, 10]]) {
    assert.throws(() => totalPages(a, b), RangeError, `${a},${b}`);
    assert.throws(() => pageOf(a, b), RangeError);
  }
});
