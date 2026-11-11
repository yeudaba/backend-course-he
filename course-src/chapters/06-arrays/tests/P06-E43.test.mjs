import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E43.js";
const get = () => exportsOf(import.meta.url, FILE, ["serve"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מוציאה עד count אנשים לפי הסדר", async () => {
  const { serve } = await get();
  const queue = ["דנה", "עומר", "נועה", "יוסי"];
  assert.deepEqual(serve(queue, 2), ["דנה", "עומר"]);
  assert.deepEqual(queue, ["נועה", "יוסי"], "התור צריך להשתנות");
});
test("ברירת מחדל: 1", async () => {
  const { serve } = await get();
  const queue = ["א", "ב"];
  assert.deepEqual(serve(queue), ["א"]);
  assert.deepEqual(queue, ["ב"]);
});
test("פחות אנשים מ־count — מוציאה את כולם, בלי undefined", async () => {
  const { serve } = await get();
  const queue = ["א", "ב"];
  assert.deepEqual(serve(queue, 5), ["א", "ב"]);
  assert.deepEqual(queue, []);
  assert.deepEqual(serve(queue, 3), []);
});
test("count = 0", async () => {
  const { serve } = await get();
  const queue = ["א"];
  assert.deepEqual(serve(queue, 0), []);
  assert.deepEqual(queue, ["א"]);
});
