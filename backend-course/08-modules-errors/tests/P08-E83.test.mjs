import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E83.js";
const get = () => exportsOf(import.meta.url, FILE, ["isMobile", "isPostalCode", "isUsername"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const check = (fn, name, yes, no) => {
  for (const t of yes) assert.equal(fn(t), true, `${name}("${t}") צריך להיות true`);
  for (const t of no) assert.equal(fn(t), false, `${name}("${t}") צריך להיות false`);
};

test("isMobile", async () => {
  const { isMobile } = await get();
  check(isMobile, "isMobile",
    ["052-1234567", "0521234567", "0541234567", "058-9999999"],
    ["052-123456", "05212345678", "x0521234567", "0521234567x", "052--1234567", "031234567", "052 1234567", ""]);
});
test("isPostalCode", async () => {
  const { isPostalCode } = await get();
  check(isPostalCode, "isPostalCode", ["6100000", "0000000"], ["610000", "61000000", "abc1234567", "61-00000", ""]);
});
test("isUsername", async () => {
  const { isUsername } = await get();
  check(isUsername, "isUsername",
    ["dana_2026", "abc", "a_b", "abcdefghijklmnop"],
    ["2dana", "ab", "abcdefghijklmnopq", "Dana", "dana-2026", "dana 2026", "_dana", "דנה", ""]);
});
test("אותה תשובה גם בקריאה חוזרת", async () => {
  const { isMobile, isPostalCode, isUsername } = await get();
  for (let i = 0; i < 3; i++) {
    assert.equal(isMobile("052-1234567"), true, "isMobile החזיר תשובה אחרת בקריאה חוזרת — יש g ב־regex?");
    assert.equal(isPostalCode("6100000"), true, "isPostalCode החזיר תשובה אחרת בקריאה חוזרת — יש g ב־regex?");
    assert.equal(isUsername("dana_2026"), true, "isUsername החזיר תשובה אחרת בקריאה חוזרת — יש g ב־regex?");
  }
});
test("עם regex", () => {
  assert.match(src(), /\.test\s*\(/, "השתמש ב־regex ו־test");
});
