import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, code } from "./_ts.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const FILE = "P27-E27.ts";
const get = () => exportsOf(import.meta.url, FILE, ["mergeSorted", "mergeAll"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("mergeSorted — שתי רשימות, כולל ריקות וכפולים", async () => {
  const { mergeSorted } = await get();
  assert.deepEqual(mergeSorted([1, 4, 9], [2, 3, 10, 11]), [1, 2, 3, 4, 9, 10, 11]);
  assert.deepEqual(mergeSorted([], [1, 2]), [1, 2]);
  assert.deepEqual(mergeSorted([1, 2], []), [1, 2]);
  assert.deepEqual(mergeSorted([], []), []);
  assert.deepEqual(mergeSorted([1, 1, 5], [1, 5]), [1, 1, 1, 5, 5]);
  assert.deepEqual(mergeSorted([-10, 100], [2, 30]), [-10, 2, 30, 100], "השוואה מספרית, לא כטקסט");
  const a = [1, 3];
  const b = [2];
  mergeSorted(a, b);
  assert.deepEqual([a, b], [[1, 3], [2]], "לא משנים את הקלט");
});
test("mergeAll — הרבה רשימות", async () => {
  const { mergeAll } = await get();
  assert.deepEqual(mergeAll([[5, 20], [1, 2, 30], [], [7], [3, 3]]), [1, 2, 3, 3, 5, 7, 20, 30]);
  assert.deepEqual(mergeAll([[4]]), [4]);
  assert.deepEqual(mergeAll([]), []);
});
test("200 רשימות של 1,000 — מהר, בלי sort", async () => {
  const { mergeSorted, mergeAll } = await get();
  const rand = seeded(7);
  const lists = Array.from({ length: 200 }, () => {
    let v = 0;
    return Array.from({ length: 1000 }, () => (v += Math.floor(rand() * 10)));
  });
  const expected = lists.flat().sort((x, y) => x - y);
  assert.deepEqual(fastEnough(() => mergeAll(lists), 400, "mergeAll על 200,000 ערכים"), expected);
  const big = Array.from({ length: 100_000 }, (_, i) => i * 2);
  fastEnough(() => mergeSorted(big, big.map((x) => x + 1)), 200, "mergeSorted על 200,000 ערכים");
  assert.doesNotMatch(code(import.meta.url, FILE), /\.sort\s*\(/, "המטרה היא למזג ביד, בלי sort — הרשימות כבר ממוינות");
});
