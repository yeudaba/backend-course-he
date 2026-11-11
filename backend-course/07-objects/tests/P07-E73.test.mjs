import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E73.js";
const get = () => exportsOf(import.meta.url, FILE, ["hasDuplicates"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("בלי כפילויות", async () => {
  const { hasDuplicates } = await get();
  assert.equal(hasDuplicates([1, 2, 3]), false);
  assert.equal(hasDuplicates([]), false);
  assert.equal(hasDuplicates([1, "1"]), false, "1 ו־\"1\" שונים");
});
test("עם כפילויות", async () => {
  const { hasDuplicates } = await get();
  assert.equal(hasDuplicates(["a", "b", "a"]), true);
  assert.equal(hasDuplicates([0, 0]), true);
});
test("עם Set", () => {
  assert.match(src(), /new\s+Set\s*\(/, "השתמש ב־Set");
});
