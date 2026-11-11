import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P05-E26.js", ["makeCounter"]);

test("makeCounter מחזירה פונקציה", async () => {
  const { makeCounter } = await get();
  assert.equal(typeof makeCounter(), "function", "makeCounter() צריכה להחזיר פונקציה (return () => ...), לא מספר");
});
test("בלי ארגומנט: 1, 2, 3", async () => {
  const { makeCounter } = await get();
  const c = makeCounter();
  assert.deepEqual([c(), c(), c()], [1, 2, 3], "הקריאה הראשונה מחזירה 1 (המונה גדל ואז חוזר)");
});
test("עם start: makeCounter(100) ← 101, 102", async () => {
  const { makeCounter } = await get();
  const c = makeCounter(100);
  assert.deepEqual([c(), c()], [101, 102]);
});
test("לכל מונה זיכרון משלו", async () => {
  const { makeCounter } = await get();
  const a = makeCounter();
  const b = makeCounter(10);
  a();
  a();
  b();
  assert.equal(a(), 3, "b() שינה את a — המשתנה צריך להיות בתוך makeCounter, לא מחוץ לה");
  assert.equal(b(), 12);
});
