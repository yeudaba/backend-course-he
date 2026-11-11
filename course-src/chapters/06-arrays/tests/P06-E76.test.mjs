import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E76.js";
const get = () => exportsOf(import.meta.url, FILE, ["longest"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("הארוכה ביותר", async () => {
  const { longest } = await get();
  assert.equal(longest(["api", "backend", "node"]), "backend");
  assert.equal(longest(["a", "bbb", "cc"]), "bbb");
  assert.equal(longest(["x"]), "x");
});
test("תיקו — הראשונה; ריק ← \"\"", async () => {
  const { longest } = await get();
  assert.equal(longest(["ab", "cd"]), "ab");
  assert.equal(longest([]), "");
});
test("עם reduce", () => {
  assert.match(src(), /\.reduce\s*\(/, "השתמש ב־reduce");
});
