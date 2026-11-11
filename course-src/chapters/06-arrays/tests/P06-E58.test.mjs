import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E58.js";
const get = () => exportsOf(import.meta.url, FILE, ["longestStreak"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("רצף ניצחונות (ברירת מחדל W)", async () => {
  const { longestStreak } = await get();
  assert.equal(longestStreak(["W", "W", "L", "W", "W", "W", "D"]), 3);
  assert.equal(longestStreak(["W", "L", "W"]), 1);
  assert.equal(longestStreak(["D", "D"]), 0);
});
test("רצף בסוף המערך נספר", async () => {
  const { longestStreak } = await get();
  assert.equal(longestStreak(["L", "W", "W"]), 2);
  assert.equal(longestStreak(["W", "W", "W", "W"]), 4);
});
test("סוג אחר", async () => {
  const { longestStreak } = await get();
  assert.equal(longestStreak(["W", "L", "L", "L", "W"], "L"), 3);
  assert.equal(longestStreak(["D", "W", "D", "D"], "D"), 2);
});
test("מערך ריק", async () => {
  const { longestStreak } = await get();
  assert.equal(longestStreak([]), 0);
});
