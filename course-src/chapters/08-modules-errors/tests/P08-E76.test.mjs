import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E76.js";
const get = () => exportsOf(import.meta.url, FILE, ["firstBad"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const counting = (bad) => {
  const c = { calls: 0 };
  c.fn = (v) => {
    c.calls++;
    return v >= bad;
  };
  return c;
};
test("מוצאת את הגרסה הראשונה השבורה", async () => {
  const { firstBad } = await get();
  for (const bad of [1, 2, 437, 500, 999, 1000]) {
    assert.equal(firstBad(1000, counting(bad).fn), bad, `הגרסה השבורה הראשונה היא ${bad}`);
  }
  assert.equal(firstBad(1, () => true), 1);
  assert.equal(firstBad(2, (v) => v >= 2), 2);
});
test("לכל היותר 11 קריאות ל־isBad", async () => {
  const { firstBad } = await get();
  for (const bad of [1, 437, 1000]) {
    const c = counting(bad);
    firstBad(1000, c.fn);
    assert.ok(c.calls <= 11, `${c.calls} קריאות — צריך חיפוש בינארי (עד 11)`);
  }
});
test("רק גרסאות בטווח 1..n", async () => {
  const { firstBad } = await get();
  firstBad(50, (v) => {
    assert.ok(v >= 1 && v <= 50, `isBad נקראה עם ${v}`);
    return v >= 30;
  });
});
