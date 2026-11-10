import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P06-E26.js", ["range"]);

test("range(1, 5) — בלי ה־end", async () => {
  const { range } = await get();
  assert.deepEqual(range(1, 5), [1, 2, 3, 4], "end לא נכנס למערך");
});
test("עם step", async () => {
  const { range } = await get();
  assert.deepEqual(range(0, 10, 3), [0, 3, 6, 9]);
  assert.deepEqual(range(-2, 3, 2), [-2, 0, 2]);
});
test("טווח ריק", async () => {
  const { range } = await get();
  assert.deepEqual(range(5, 5), [], "start === end ← מערך ריק");
  assert.deepEqual(range(5, 1), [], "start > end ← מערך ריק");
});
test("step שאינו חיובי ← מערך ריק (ולא לולאה אינסופית)", async () => {
  const { range } = await get();
  assert.deepEqual(range(0, 5, 0), []);
  assert.deepEqual(range(0, 5, -1), []);
});
test("כל קריאה מחזירה מערך חדש", async () => {
  const { range } = await get();
  const a = range(0, 3);
  a.push(99);
  assert.deepEqual(range(0, 3), [0, 1, 2], "המערך צריך להיווצר בתוך הפונקציה, לא מחוץ לה");
});
