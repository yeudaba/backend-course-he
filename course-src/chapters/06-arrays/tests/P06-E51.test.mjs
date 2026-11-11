import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E51.js";
const get = () => exportsOf(import.meta.url, FILE, ["numberedList"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שורה לכל פריט, ממוספרת מ־1", async () => {
  const { numberedList } = await get();
  assert.equal(numberedList(["חלב", "לחם", "ביצים"]), "1. חלב\n2. לחם\n3. ביצים");
  assert.equal(numberedList(["a", "b"]), "1. a\n2. b");
});
test("פריט אחד — בלי \\n", async () => {
  const { numberedList } = await get();
  assert.equal(numberedList(["רק"]), "1. רק");
});
test("רשימה ריקה ← מחרוזת ריקה", async () => {
  const { numberedList } = await get();
  assert.equal(numberedList([]), "");
});
