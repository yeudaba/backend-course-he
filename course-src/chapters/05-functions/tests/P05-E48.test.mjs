import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E48.js";
const get = () => exportsOf(import.meta.url, FILE, ["isEven","isOdd"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("isEven", async () => {
  const { isEven } = await get();
  for (const n of [0, 2, 4, -4, 100]) assert.equal(isEven(n), true, `isEven(${n})`);
  for (const n of [1, 3, -3, 99]) assert.equal(isEven(n), false, `isEven(${n})`);
});
test("isOdd — גם לשליליים", async () => {
  const { isOdd } = await get();
  for (const n of [1, 3, -3, 99]) assert.equal(isOdd(n), true, `isOdd(${n})`);
  for (const n of [0, 2, -4]) assert.equal(isOdd(n), false, `isOdd(${n})`);
});
test("בלי if, ו־isOdd משתמשת ב־isEven", () => {
  assert.doesNotMatch(src(), /\bif\s*\(/, "החזר את ההשוואה ישירות — בלי if");
  assert.match(src(), /function\s+isOdd[\s\S]*isEven\s*\(/, "isOdd צריכה לקרוא ל־isEven");
});
