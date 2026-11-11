import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E70.js";
const get = () => exportsOf(import.meta.url, FILE, ["between","not"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("between מחזירה פונקציה", async () => {
  const { between } = await get();
  const teen = between(10, 20);
  assert.equal(typeof teen, "function", "between(10, 20) צריכה להחזיר פונקציה");
  assert.equal(teen(10), true, "כולל הגבולות");
  assert.equal(teen(20), true);
  assert.equal(teen(15), true);
  assert.equal(teen(9), false);
  assert.equal(teen(21), false);
});
test("not הופכת", async () => {
  const { between, not } = await get();
  const isEven = (n) => n % 2 === 0;
  assert.deepEqual([1, 2, 3, 4].filter(not(isEven)), [1, 3]);
  assert.deepEqual([5, 12, 30, 18, 50].filter(not(between(10, 20))), [5, 30, 50]);
});
test("עם filter ו־some", async () => {
  const { between } = await get();
  const prices = [5, 12, 30, 18, 50];
  assert.deepEqual(prices.filter(between(10, 20)), [12, 18]);
  assert.equal(prices.some(between(40, 60)), true);
  assert.equal(prices.some(between(60, 70)), false);
  assert.deepEqual(prices.filter(between(0, 100)), prices);
});
