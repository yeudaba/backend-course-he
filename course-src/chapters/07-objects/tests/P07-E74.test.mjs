import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E74.js";
const get = () => exportsOf(import.meta.url, FILE, ["indexById","nameOf"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("indexById", async () => {
  const { indexById } = await get();
  const items = [{ id: 1, name: "מקלדת" }, { id: 2, name: "עכבר" }];
  const index = indexById(items);
  assert.ok(index instanceof Map, "indexById צריכה להחזיר Map");
  assert.equal(index.size, 2);
  assert.equal(index.get(2), items[1], "הערך הוא האובייקט עצמו");
  assert.equal(indexById([]).size, 0);
});
test("nameOf", async () => {
  const { indexById, nameOf } = await get();
  const index = indexById([{ id: 1, name: "מקלדת" }, { id: 7, name: "מסך" }]);
  assert.equal(nameOf(index, 1), "מקלדת");
  assert.equal(nameOf(index, 7), "מסך");
  assert.equal(nameOf(index, 9), "לא נמצא");
  assert.equal(nameOf(index, "1"), "לא נמצא", "ב־Map, ‏\"1\" ו־1 הם מפתחות שונים");
});
