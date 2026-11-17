import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E42.js";
const get = () => exportsOf(import.meta.url, FILE, ["letterCounts"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("ספירה", async () => {
  const { letterCounts } = await get();
  assert.deepEqual(letterCounts("Hello"), { h: 1, e: 1, l: 2, o: 1 });
  assert.deepEqual(letterCounts("aaa"), { a: 3 });
  assert.deepEqual(letterCounts("שלום שלום"), { "ש": 2, "ל": 2, "ו": 2, "ם": 2 });
});
test("בלי תלות באותיות גדולות, בלי רווחים", async () => {
  const { letterCounts } = await get();
  assert.deepEqual(letterCounts("a b A"), { a: 2, b: 1 });
  assert.deepEqual(letterCounts("   "), {});
});
test("מחרוזת ריקה", async () => {
  const { letterCounts } = await get();
  assert.deepEqual(letterCounts(""), {});
});
