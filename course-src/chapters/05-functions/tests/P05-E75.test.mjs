import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E75.js";
const get = () => exportsOf(import.meta.url, FILE, ["normalize","reverse","isPalindrome"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("normalize", async () => {
  const { normalize } = await get();
  assert.equal(normalize("Was it a car?"), "wasitacar");
  assert.equal(normalize("A1-b2 C3!"), "a1b2c3");
  assert.equal(normalize("!!!"), "");
});
test("reverse", async () => {
  const { reverse } = await get();
  assert.equal(reverse("Node"), "edoN");
  assert.equal(reverse(""), "");
});
test("isPalindrome", async () => {
  const { isPalindrome } = await get();
  assert.equal(isPalindrome("Was it a car or a cat I saw"), true);
  assert.equal(isPalindrome("Never odd or even!"), true);
  assert.equal(isPalindrome("Node"), false);
  assert.equal(isPalindrome("12321"), true);
});
test("isPalindrome משתמשת בשתיים האחרות", () => {
  assert.match(src(), /function\s+isPalindrome[\s\S]*normalize\s*\(/, "isPalindrome צריכה לקרוא ל־normalize");
  assert.match(src(), /function\s+isPalindrome[\s\S]*reverse\s*\(/, "isPalindrome צריכה לקרוא ל־reverse");
});
