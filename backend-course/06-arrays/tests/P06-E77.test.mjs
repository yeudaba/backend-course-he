import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E77.js";
const get = () => exportsOf(import.meta.url, FILE, ["insertAt","moveItem"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("insertAt", async () => {
  const { insertAt } = await get();
  assert.deepEqual(insertAt(["a", "b", "c"], 1, "X"), ["a", "X", "b", "c"]);
  assert.deepEqual(insertAt(["a", "b"], 2, "Z"), ["a", "b", "Z"]);
  assert.deepEqual(insertAt(["a", "b"], 0, "Z"), ["Z", "a", "b"]);
  assert.deepEqual(insertAt([], 0, 1), [1]);
});
test("moveItem", async () => {
  const { moveItem } = await get();
  assert.deepEqual(moveItem(["a", "b", "c", "d"], 0, 2), ["b", "c", "a", "d"]);
  assert.deepEqual(moveItem(["a", "b", "c", "d"], 3, 0), ["d", "a", "b", "c"]);
  assert.deepEqual(moveItem(["a", "b", "c", "d"], 1, 3), ["a", "c", "d", "b"]);
  assert.deepEqual(moveItem(["a", "b"], 1, 1), ["a", "b"]);
});
test("המקור לא משתנה", async () => {
  const { insertAt, moveItem } = await get();
  const arr = ["a", "b", "c", "d"];
  const r1 = insertAt(arr, 1, "X");
  const r2 = moveItem(arr, 0, 3);
  assert.deepEqual(arr, ["a", "b", "c", "d"], "המערך שקיבלת חייב להישאר כמו שהיה");
  assert.notEqual(r1, arr);
  assert.notEqual(r2, arr);
});
