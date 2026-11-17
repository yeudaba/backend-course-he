import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { starCheck } = await load(import.meta.url, "P30-E71.ts");

test("תשובה מלאה, כמה שורות לחלק", () => {
  const a = `Tell me about a bug:
S: In my store API a load test sold 12 of 3 units.
T: Never oversell.
A: I wrote a test with 20 parallel orders,
found two requests read the same stock,
and replaced it with a conditional UPDATE.
R: Exactly 3 sold.`;
  assert.deepEqual(starCheck(a), { missing: [], outOfOrder: false, actionShare: 0.56 });
});
test("תוויות ארוכות, סדר, חסרים", () => {
  assert.deepEqual(starCheck("Situation: a b\n  task: c\nRESULT: d e f g"), { missing: ["A"], outOfOrder: false, actionShare: 0 });
  assert.deepEqual(starCheck("A: x y\nS: z"), { missing: ["T", "R"], outOfOrder: true, actionShare: 0.67 });
  assert.deepEqual(starCheck("S: a\nA: b\nA: c\nR: d"), { missing: ["T"], outOfOrder: true, actionShare: 0.5 });
  assert.deepEqual(starCheck("After that I fixed it\nAnd it worked"), { missing: ["S", "T", "A", "R"], outOfOrder: false, actionShare: 0 });
  assert.deepEqual(starCheck(""), { missing: ["S", "T", "A", "R"], outOfOrder: false, actionShare: 0 });
});
