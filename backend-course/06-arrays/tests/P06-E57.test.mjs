import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E57.js";
const get = () => exportsOf(import.meta.url, FILE, ["capitalize","capitalizeWords"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("capitalize — מילה אחת", async () => {
  const { capitalize } = await get();
  assert.equal(capitalize("hello"), "Hello");
  assert.equal(capitalize("wORLD"), "World");
  assert.equal(capitalize("a"), "A");
});
test("capitalizeWords", async () => {
  const { capitalizeWords } = await get();
  assert.equal(capitalizeWords("hello WORLD"), "Hello World");
  assert.equal(capitalizeWords("  learn   node js "), "Learn Node Js");
  assert.equal(capitalizeWords("api"), "Api");
  assert.equal(capitalizeWords(""), "");
  assert.equal(capitalizeWords("   "), "");
});
test("capitalizeWords משתמשת ב־capitalize", () => {
  assert.match(src(), /function\s+capitalizeWords[\s\S]*capitalize\s*\(|capitalizeWords\s*=[\s\S]*capitalize\s*\(/, "capitalizeWords צריכה לקרוא ל־capitalize");
});
