import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E50.js";
const get = () => exportsOf(import.meta.url, FILE, ["validatePassword"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("לפי הסדר", async () => {
  const { validatePassword } = await get();
  assert.equal(validatePassword(""), "חובה להזין סיסמה");
  assert.equal(validatePassword("abc1"), "לפחות 8 תווים");
  assert.equal(validatePassword("abcdefgh"), "חייבת להכיל ספרה");
  assert.equal(validatePassword("Dana2024!", "dana"), "הסיסמה לא יכולה להכיל את שם המשתמש");
});
test("תקינה ← null", async () => {
  const { validatePassword } = await get();
  assert.equal(validatePassword("Secret2024!", "dana"), null);
  assert.equal(validatePassword("abcdefg1"), null, "בלי שם משתמש — אין בדיקה 4");
});
test("שם משתמש באותיות גדולות", async () => {
  const { validatePassword } = await get();
  assert.equal(validatePassword("myYOSSI123", "Yossi"), "הסיסמה לא יכולה להכיל את שם המשתמש");
});
