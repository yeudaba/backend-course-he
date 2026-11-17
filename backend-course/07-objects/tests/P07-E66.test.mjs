import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E66.js";
const get = () => exportsOf(import.meta.url, FILE, ["countBy","topKeys"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("countBy", async () => {
  const { countBy } = await get();
  const orders = [{ city: "חיפה" }, { city: "אילת" }, { city: "חיפה" }, { city: "באר שבע" }];
  assert.deepEqual(countBy(orders, (o) => o.city), { "חיפה": 2, "אילת": 1, "באר שבע": 1 });
  assert.deepEqual(countBy(["a", "bb", "cc"], (w) => w.length), { 1: 1, 2: 2 });
  assert.deepEqual(countBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? "even" : "odd")), { odd: 2, even: 2 });
  assert.deepEqual(countBy([], (x) => x), {});
});
test("topKeys", async () => {
  const { topKeys } = await get();
  assert.deepEqual(topKeys({ "חיפה": 2, "אילת": 1, "באר שבע": 1 }, 2), ["חיפה", "אילת"]);
  assert.deepEqual(topKeys({ b: 5, a: 5, c: 9 }, 3), ["c", "a", "b"], "בתיקו — לפי סדר אלפביתי");
  assert.deepEqual(topKeys({ x: 1 }, 5), ["x"]);
  assert.deepEqual(topKeys({}, 2), []);
});
test("topKeys לא משנה את האובייקט", async () => {
  const { topKeys } = await get();
  const counts = { b: 1, a: 2 };
  topKeys(counts, 1);
  assert.deepEqual(counts, { b: 1, a: 2 });
});
