import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E91.js";
const get = () => exportsOf(import.meta.url, FILE, ["isHexColor"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("צבעים תקינים", async () => {
  const { isHexColor } = await get();
  for (const t of ["#fff", "#FFF", "#000", "#1a2B3c", "#abcdef", "#09F"]) {
    assert.equal(isHexColor(t), true, `isHexColor("${t}") צריך להיות true`);
  }
});
test("צבעים לא תקינים", async () => {
  const { isHexColor } = await get();
  for (const t of ["fff", "#ff", "#ffff", "#fffff", "#1234567", "#ggg", "#12345g", " #fff", "#fff ", "##fff", "#", ""]) {
    assert.equal(isHexColor(t), false, `isHexColor("${t}") צריך להיות false`);
  }
});
test("אותה תשובה גם בקריאה חוזרת", async () => {
  const { isHexColor } = await get();
  for (let i = 0; i < 3; i++) {
    assert.equal(isHexColor("#fff"), true, "isHexColor החזיר תשובה אחרת בקריאה חוזרת — יש g ב־regex?");
  }
});
test("עם regex", () => {
  assert.match(src(), /\.test\s*\(/, "השתמש ב־regex ו־test");
});
