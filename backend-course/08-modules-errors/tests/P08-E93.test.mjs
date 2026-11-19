import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E93.js";
const get = () => exportsOf(import.meta.url, FILE, ["extractHashtags"]);

test("האשטגים, בלי # ובאותיות קטנות", async () => {
  const { extractHashtags } = await get();
  assert.deepEqual(extractHashtags("לומד #NodeJS ו־#backend"), ["nodejs", "backend"]);
  assert.deepEqual(extractHashtags("#a1 #b_2!"), ["a1", "b_2"]);
});
test("עברית", async () => {
  const { extractHashtags } = await get();
  assert.deepEqual(extractHashtags("יום ראשון ב־#עבודה_חדשה, #תכנות 2026"), ["עבודה_חדשה", "תכנות"], "האשטג בעברית — צריך \\p{L} עם הדגל u");
});
test("בלי כפילויות, לפי ההופעה הראשונה", async () => {
  const { extractHashtags } = await get();
  assert.deepEqual(extractHashtags("#JS #node #js #Node #sql"), ["js", "node", "sql"]);
});
test("אין האשטגים ← []", async () => {
  const { extractHashtags } = await get();
  assert.deepEqual(extractHashtags("סתם טקסט"), [], "בלי האשטגים: מערך ריק, לא null");
  assert.deepEqual(extractHashtags(""), []);
  assert.deepEqual(extractHashtags("# לבד, ו־#!"), [], "# בלי אותיות אחריו הוא לא האשטג");
});
