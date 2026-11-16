import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { perSecond, perDayFrom } = await load(import.meta.url, "P28-E33.ts");

test("perSecond — מעוגל לספרה אחת", () => {
  assert.equal(perSecond(1_000_000), 11.6, "מיליון ביום");
  assert.equal(perSecond(86_400), 1);
  assert.equal(perSecond(100_000_000), 1157.4);
  assert.equal(perSecond(0), 0);
  assert.equal(perSecond(5_000), 0.1);
});
test("perDayFrom — מספר שלם", () => {
  assert.equal(perDayFrom(12), 1_036_800);
  assert.equal(perDayFrom(0.5), 43_200);
  assert.equal(perDayFrom(1157.4), 99_999_360);
});
test("קלט לא תקין ← RangeError", () => {
  for (const bad of [-1, NaN, Infinity]) {
    assert.throws(() => perSecond(bad), RangeError, `perSecond(${bad})`);
    assert.throws(() => perDayFrom(bad), RangeError, `perDayFrom(${bad})`);
  }
});
