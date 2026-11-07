import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { validatePassword } = loadNest(import.meta.url, "P21-E07.ts");

test("סיסמה טובה", () => {
  assert.deepEqual(validatePassword("purple-elephant-42", "dana@example.com"), []);
  assert.deepEqual(validatePassword("סוס קפה סוללה", "dana@example.com"), [], "עברית ורווחים — מותר");
});
test("אורך", () => {
  assert.deepEqual(validatePassword("short", "dana@example.com"), ["לפחות 8 תווים"]);
  assert.deepEqual(validatePassword("a".repeat(72), "dana@example.com"), []);
  assert.deepEqual(validatePassword("a".repeat(73), "dana@example.com"), ["עד 72 בתים"]);
  assert.deepEqual(validatePassword("א".repeat(36), "dana@example.com"), [], "36 אותיות = 72 בתים");
  assert.deepEqual(validatePassword("א".repeat(37), "dana@example.com"), ["עד 72 בתים"]);
});
test("נפוצה, ומכילה את האימייל", () => {
  assert.deepEqual(validatePassword("Password1", "x@example.com"), ["סיסמה נפוצה מדי"]);
  assert.deepEqual(validatePassword("12345678", "x@example.com"), ["סיסמה נפוצה מדי"]);
  assert.deepEqual(validatePassword("my-DANA-pass", "dana@example.com"), ["הסיסמה לא יכולה להכיל את האימייל"]);
  assert.deepEqual(validatePassword("abcdefgh-1", "ab@example.com"), [], "חלק מקומי קצר מ־3 — לא בודקים");
  assert.deepEqual(validatePassword("dana", "dana@example.com"), ["לפחות 8 תווים", "הסיסמה לא יכולה להכיל את האימייל"], "כמה בעיות — כולן, לפי הסדר");
});
