// P22-E26 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { paginate } from "./P22-E26.ts";

test("עמוד ראשון, אמצעי ואחרון", () => {
  assert.deepEqual(paginate(23, 1), { pages: 3, offset: 0, hasPrev: false, hasNext: true });
  assert.deepEqual(paginate(23, 2), { pages: 3, offset: 10, hasPrev: true, hasNext: true });
  assert.deepEqual(paginate(23, 3), { pages: 3, offset: 20, hasPrev: true, hasNext: false });
});

test("מספר עמודים: מתחלק בדיוק, לא מתחלק, ואפס שורות", () => {
  assert.equal(paginate(20, 1).pages, 2);
  assert.equal(paginate(21, 1).pages, 3);
  assert.deepEqual(paginate(0, 1), { pages: 0, offset: 0, hasPrev: false, hasNext: false });
});

test("pageSize מפורש, וגבולות 1 ו־100", () => {
  assert.deepEqual(paginate(5, 2, 2), { pages: 3, offset: 2, hasPrev: true, hasNext: true });
  assert.equal(paginate(500, 1, 1).pages, 500);
  assert.equal(paginate(500, 1, 100).pages, 5);
});

test("קלט לא תקין ← RangeError", () => {
  const bad: [number, number, number?][] = [
    [-1, 1],
    [10.5, 1],
    [10, 0],
    [10, -1],
    [10, 1.5],
    [10, 1, 0],
    [10, 1, 101],
    [10, 1, 2.5],
  ];
  for (const [total, page, size] of bad) {
    assert.throws(() => paginate(total, page, size), RangeError, `paginate(${total}, ${page}, ${size})`);
  }
});
