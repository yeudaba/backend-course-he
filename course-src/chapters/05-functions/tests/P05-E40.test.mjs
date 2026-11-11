import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E40.js";
const get = () => exportsOf(import.meta.url, FILE, ["sumTo"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("4 ו־100", async () => {
  const { sumTo } = await get();
  assert.equal(sumTo(4), 10);
  assert.equal(sumTo(100), 5050);
});
test("0, 1 ושלילי", async () => {
  const { sumTo } = await get();
  assert.equal(sumTo(0), 0);
  assert.equal(sumTo(1), 1);
  assert.equal(sumTo(-5), 0);
});
test("שתי קריאות ברצף — אותה תשובה", async () => {
  const { sumTo } = await get();
  sumTo(10);
  assert.equal(sumTo(10), 55, "הקריאה השנייה החזירה תשובה אחרת — הצובר צריך להיות בתוך הפונקציה");
});
test("עם לולאה", () => assert.match(src(), /\b(for|while)\s*\(/, "התרגיל מתרגל לולאה בתוך פונקציה"));
