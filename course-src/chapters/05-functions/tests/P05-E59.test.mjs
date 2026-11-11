import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E59.js";
const get = () => exportsOf(import.meta.url, FILE, ["transformText","shout"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("transformText", async () => {
  const { transformText } = await get();
  assert.equal(transformText("abc", (ch) => ch.toUpperCase()), "ABC");
  assert.equal(transformText("abc", (ch) => ch + ch), "aabbcc");
  assert.equal(transformText("a-b", (ch) => (ch === "-" ? "" : ch)), "ab");
  assert.equal(transformText("", (ch) => ch), "");
});
test("shout", async () => {
  const { shout } = await get();
  assert.equal(shout("hi"), "HI!");
  assert.equal(shout("Node"), "NODE!");
});
test("arrow functions", () => {
  assert.match(src(), /const\s+transformText\s*=\s*\(/, "כתוב את transformText כ־arrow function: const transformText = (text, fn) => { ... }");
  assert.match(src(), /const\s+shout\s*=\s*\(?\s*\w+\s*\)?\s*=>\s*[^{\s]/, "כתוב את shout כ־arrow function בשורה אחת, בלי { }");
});
