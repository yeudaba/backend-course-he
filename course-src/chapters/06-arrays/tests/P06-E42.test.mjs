import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E42.js";
const get = () => exportsOf(import.meta.url, FILE, ["digits"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("ספרות משמאל לימין", async () => {
  const { digits } = await get();
  assert.deepEqual(digits(1234), [1, 2, 3, 4]);
  assert.deepEqual(digits(507), [5, 0, 7], "אפס באמצע הוא ספרה");
  assert.deepEqual(digits(90), [9, 0]);
  assert.deepEqual(digits(7), [7]);
  assert.deepEqual(digits(2026), [2, 0, 2, 6]);
});
test("0 ← [0]", async () => {
  const { digits } = await get();
  assert.deepEqual(digits(0), [0]);
});
test("בלי להמיר למחרוזת", () => {
  assert.doesNotMatch(src(), /String\(|toString|\.split\(|""\s*\+\s*n\b|\bn\s*\+\s*""/, "התרגיל מבקש לפרק עם % ו־Math.floor, בלי להפוך את המספר לטקסט");
  assert.match(src(), /%\s*10/, "השתמש ב־n % 10 כדי לקבל את הספרה הימנית");
});
