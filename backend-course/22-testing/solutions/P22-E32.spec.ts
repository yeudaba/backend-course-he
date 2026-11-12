// P22-E32 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { shippingCost } from "./P22-E32.ts";

test("ישראל: מתחת לגבול משלמים, מהגבול חינם", () => {
  assert.equal(shippingCost(1, "IL"), 2990);
  assert.equal(shippingCost(19999, "IL"), 2990);
  assert.equal(shippingCost(20000, "IL"), 0);
});

test("חו״ל: גבול אחר ומחיר אחר", () => {
  assert.equal(shippingCost(20000, "abroad"), 9990);
  assert.equal(shippingCost(49999, "abroad"), 9990);
  assert.equal(shippingCost(50000, "abroad"), 0);
});

test("קלט לא תקין ← RangeError", () => {
  for (const total of [0, -1, 100.5]) {
    assert.throws(() => shippingCost(total, "IL"), RangeError, `total = ${total}`);
  }
  assert.throws(() => shippingCost(1000, "US" as "IL"), RangeError);
});
