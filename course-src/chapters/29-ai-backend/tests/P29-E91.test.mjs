import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { compareEvals } = await load(import.meta.url, "P29-E91.ts");
const r = (spec) => spec.split(" ").map((s) => ({ name: s.slice(1), passed: s[0] === "+" }));

test("שיפור עם regression — לא ok", () => {
  assert.deepEqual(compareEvals(r("+a +b -c -d +e"), r("+a -b +c +d +e")), { before: 0.6, after: 0.8, regressions: ["b"], fixed: ["c", "d"], missing: [], ok: false });
});
test("שיפור נקי — ok; ירידה בלי regression (מקרה חדש שנכשל) — לא ok", () => {
  assert.deepEqual(compareEvals(r("+a -b -c"), r("-c +b +a")), { before: 0.33, after: 0.67, regressions: [], fixed: ["b"], missing: [], ok: true });
  assert.deepEqual(compareEvals(r("+a +b"), r("+a +b -n")), { before: 1, after: 0.67, regressions: [], fixed: [], missing: [], ok: false });
  assert.deepEqual(compareEvals(r("+a -b"), r("+a -b")).ok, true, "בלי שינוי");
});
test("מקרה שנמחק ← missing (לא regression)", () => {
  assert.deepEqual(compareEvals(r("+a -b +c"), r("+a +c")), { before: 0.67, after: 1, regressions: [], fixed: [], missing: ["b"], ok: false });
  assert.deepEqual(compareEvals(r("+x +y"), r("+y")).regressions, []);
});
test("ריקים", () => {
  assert.deepEqual(compareEvals([], []), { before: 0, after: 0, regressions: [], fixed: [], missing: [], ok: true });
  assert.deepEqual(compareEvals([], r("+a")), { before: 0, after: 1, regressions: [], fixed: [], missing: [], ok: true });
});
