import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P07-E26.js", ["mapValues"]);

test("מכפיל מחירים", async () => {
  const { mapValues } = await get();
  assert.deepEqual(mapValues({ keyboard: 100, mouse: 50 }, (p) => p * 2), { keyboard: 200, mouse: 100 });
});
test("fn מקבלת את הערך (לא את הזוג)", async () => {
  const { mapValues } = await get();
  assert.deepEqual(mapValues({ a: " x ", b: "y " }, (s) => s.trim()), { a: "x", b: "y" });
  assert.deepEqual(mapValues({ n: 3 }, (v) => typeof v), { n: "number" });
});
test("אובייקט ריק", async () => {
  const { mapValues } = await get();
  assert.deepEqual(mapValues({}, (v) => v), {});
});
test("לא משנה את המקור ומחזיר אובייקט חדש", async () => {
  const { mapValues } = await get();
  const src = { a: 1 };
  const out = mapValues(src, (v) => v + 1);
  assert.deepEqual(src, { a: 1 }, "האובייקט המקורי השתנה");
  assert.notEqual(out, src, "צריך להחזיר אובייקט חדש");
});
test("משתמש ב־Object.fromEntries", () => {
  assert.match(code(import.meta.url, "P07-E26.js"), /Object\.fromEntries\s*\(/, "התרגיל מתרגל Object.fromEntries");
});
