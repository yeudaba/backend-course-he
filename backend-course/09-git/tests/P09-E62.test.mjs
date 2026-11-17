import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E62.js";
const get = () => exportsOf(import.meta.url, FILE, ["resolve"]);

const TEXT = ["<<<<<<< HEAD", 'const greeting = "שלום וברכה";', "=======", 'const greeting = "Hello";', ">>>>>>> feature/english", "module.exports = { greeting };"].join("\n");
test("theirs / ours / both", async () => {
  const { resolve } = await get();
  assert.equal(resolve(TEXT, "theirs"), 'const greeting = "Hello";\nmodule.exports = { greeting };');
  assert.equal(resolve(TEXT, "ours"), 'const greeting = "שלום וברכה";\nmodule.exports = { greeting };');
  assert.equal(resolve(TEXT, "both"), 'const greeting = "שלום וברכה";\nconst greeting = "Hello";\nmodule.exports = { greeting };');
});
test("כמה התנגשויות ושורות בכל צד", async () => {
  const { resolve } = await get();
  const t2 = ["top", "<<<<<<< HEAD", "a1", "a2", "=======", "b1", ">>>>>>> x", "mid", "<<<<<<< HEAD", "c", "=======", ">>>>>>> x", "end"].join("\n");
  assert.equal(resolve(t2, "ours"), "top\na1\na2\nmid\nc\nend");
  assert.equal(resolve(t2, "theirs"), "top\nb1\nmid\nend", "צד ריק — אין שורות");
});
test("בלי התנגשויות — בלי שינוי", async () => {
  const { resolve } = await get();
  assert.equal(resolve("a\nb", "ours"), "a\nb");
});
