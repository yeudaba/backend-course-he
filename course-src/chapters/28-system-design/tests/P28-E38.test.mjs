import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { monthlyStorage } = await load(import.meta.url, "P28-E38.ts");

test("בלי צמיחה — קווי", () => {
  assert.deepEqual(monthlyStorage(1_000_000, 500, 0, 3), [15, 30, 45]);
});
test("עם צמיחה של 20%", () => {
  assert.deepEqual(monthlyStorage(1_000_000, 500, 0.2, 4), [15, 33, 54.6, 80.52]);
});
test("עיגול רק בסוף", () => {
  // 7 × 30 × 1,000,000 = 0.21GB בחודש; עם 0.333 צמיחה העיגול המצטבר היה סוטה
  assert.deepEqual(monthlyStorage(7, 1_000_000, 1 / 3, 5), [0.21, 0.49, 0.86, 1.36, 2.02]);
  assert.deepEqual(monthlyStorage(10, 10, 0.5, 0), []);
});
