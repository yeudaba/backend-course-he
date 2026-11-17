import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { findCounterexample } = await load(import.meta.url, "P27-E82.ts");
const gen = (rnd) => Array.from({ length: Math.floor(rnd() * 8) }, () => Math.floor(rnd() * 5));
const slowMax = (a) => (a.length ? Math.max(...a) : null);

test("מוצא דוגמה נגדית, ו־null כשאין", () => {
  const buggy = (a) => (a.length ? a.slice(0, -1).reduce((m, x) => Math.max(m, x), a[0]) : null); // מפספס את האחרון
  const r = findCounterexample(buggy, slowMax, gen, 500);
  assert.ok(r, "צריך למצוא");
  assert.notDeepEqual(r.fast, r.slow);
  assert.deepEqual(r.fast, buggy(r.input));
  assert.deepEqual(r.slow, slowMax(r.input));
  const good = (a) => (a.length ? a.reduce((m, x) => Math.max(m, x), -Infinity) : null);
  assert.equal(findCounterexample(good, slowMax, gen, 500), null);
});
test("עותק לכל פונקציה, ו־seed קבוע", () => {
  const sorts = (a) => a.sort((x, y) => x - y).length;
  const firstIsMin = (a) => (a.length ? a[0] === Math.min(...a) : true) ? a.length : -1;
  assert.ok(findCounterexample(sorts, firstIsMin, gen, 300), "אם fast ממיין במקום, slow עדיין צריך לראות את הקלט המקורי");
  const inputs1 = [], inputs2 = [];
  findCounterexample((a) => (inputs1.push(a), 0), () => 0, gen, 20, 42);
  findCounterexample((a) => (inputs2.push(a), 0), () => 0, gen, 20, 42);
  assert.deepEqual(inputs1, inputs2, "אותו seed ← אותם קלטים");
  const inputs3 = [];
  findCounterexample((a) => (inputs3.push(a), 0), () => 0, gen, 20, 7);
  assert.notDeepEqual(inputs1, inputs3);
  let s = 1 >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 2 ** 32);
  const expected = gen(rnd);
  const seen = [];
  findCounterexample((a) => (seen.push(a), 0), () => 0, gen, 1);
  assert.deepEqual(seen[0], expected, "ברירת מחדל seed 1, עם ה־LCG מהמשימה");
});
