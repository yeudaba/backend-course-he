import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E50.js";
const get = () => exportsOf(import.meta.url, FILE, ["countAbove"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("סופרת רק את הגדולים ממש", async () => {
  const { countAbove } = await get();
  assert.equal(countAbove([5, 12, 8, 20], 8), 2, "8 לא גדול מ־8");
  assert.equal(countAbove([1, 2, 3], 0), 3);
  assert.equal(countAbove([1, 2, 3], 3), 0);
  assert.equal(countAbove([-5, -1, 4], -2), 2);
});
test("מערך ריק ← 0", async () => {
  const { countAbove } = await get();
  assert.equal(countAbove([], 0), 0);
});
test("for...of", () => {
  assert.match(src(), /for\s*\(\s*(const|let)\s+\w+\s+of\s/, "השתמש ב־for...of");
});
