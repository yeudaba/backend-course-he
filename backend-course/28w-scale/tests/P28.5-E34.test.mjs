import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { errorBudget } = await load(import.meta.url, "P28.5-E34.ts");

test("99.9% ב־30 יום", () => {
  assert.deepEqual(errorBudget(0.999, 30, 25), { budgetMinutes: 43.2, usedPct: 57.9, remainingMinutes: 18.2 });
  assert.deepEqual(errorBudget(0.999, 30, 0), { budgetMinutes: 43.2, usedPct: 0, remainingMinutes: 43.2 });
});
test("חריגה, וחלונות אחרים", () => {
  assert.deepEqual(errorBudget(0.99, 7, 150), { budgetMinutes: 100.8, usedPct: 148.8, remainingMinutes: 0 });
  assert.deepEqual(errorBudget(0.9995, 28, 5), { budgetMinutes: 20.2, usedPct: 24.8, remainingMinutes: 15.2 });
});
test("קלט לא תקין", () => {
  for (const args of [[1, 30, 0], [0, 30, 0], [1.2, 30, 0], [0.99, 0, 0], [0.99, 30, -1]]) assert.throws(() => errorBudget(...args), RangeError, String(args));
});
