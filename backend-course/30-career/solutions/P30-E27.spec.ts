// P30-E27: בדיקות לקוד שה־AI כתב. כל בדיקה — מקרה גבול שקל לפספס
import { test } from "node:test";
import assert from "node:assert/strict";
import { paginate } from "./P30-E27.ts";

test("עמוד ראשון ושני: offset מתחיל מ־0", () => {
  assert.deepEqual(paginate(45, 1, 20), { offset: 0, limit: 20, totalPages: 3, hasNext: true });
  assert.equal(paginate(45, 2, 20).offset, 20);
});
test("totalPages מעגל למעלה, ו־hasNext בעמוד האחרון false", () => {
  assert.equal(paginate(41, 1, 20).totalPages, 3);
  assert.equal(paginate(40, 2, 20).hasNext, false, "40 פריטים, עמוד 2 מתוך 2");
  assert.equal(paginate(41, 2, 20).hasNext, true);
});
test("בלי פריטים בכלל", () => {
  assert.deepEqual(paginate(0), { offset: 0, limit: 20, totalPages: 0, hasNext: false });
});
test("pageSize מוגבל ל־100", () => {
  assert.equal(paginate(1000, 1, 500).limit, 100);
  assert.equal(paginate(1000, 3, 500).offset, 200);
});
test("קלט לא תקין ← RangeError", () => {
  for (const [p, s] of [[0, 20], [-1, 20], [1.5, 20], [1, 0], [1, 2.5]]) {
    assert.throws(() => paginate(10, p, s), RangeError, `page=${p} pageSize=${s}`);
  }
});
