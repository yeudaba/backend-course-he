import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E42.js";
const get = () => exportsOf(import.meta.url, FILE, ["repeatText"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("ab-ab-ab", async () => {
  const { repeatText } = await get();
  assert.equal(repeatText("ab", 3, "-"), "ab-ab-ab");
  assert.equal(repeatText("הי", 2, " "), "הי הי");
});
test("פעם אחת ואפס פעמים", async () => {
  const { repeatText } = await get();
  assert.equal(repeatText("x", 1, ","), "x");
  assert.equal(repeatText("x", 0, ","), "");
});
test("מפריד ארוך", async () => {
  const { repeatText } = await get();
  assert.equal(repeatText("a", 3, " | "), "a | a | a");
});
test("בלי repeat", () => assert.doesNotMatch(src(), /\.repeat\(/, "כתוב את הלולאה בעצמך — בלי repeat"));
