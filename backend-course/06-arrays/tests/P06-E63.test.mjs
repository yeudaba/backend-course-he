import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E63.js";
const get = () => exportsOf(import.meta.url, FILE, ["fullNames"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שם מלא לכל זוג", async () => {
  const { fullNames } = await get();
  assert.deepEqual(fullNames(["דנה", "עומר"], ["לוי", "כהן"]), ["דנה לוי", "עומר כהן"]);
  assert.deepEqual(fullNames(["A"], ["B"]), ["A B"]);
  assert.deepEqual(fullNames([], []), []);
});
test("עם map, בלי לולאה", () => {
  assert.match(src(), /\.map\s*\(/, "השתמש ב־map");
  assert.doesNotMatch(src(), /\bfor\s*\(|\bwhile\s*\(/, "בלי לולאות — רק map");
});
