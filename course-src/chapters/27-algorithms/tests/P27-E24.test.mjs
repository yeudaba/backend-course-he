import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { minCoins, countWays } = await load(import.meta.url, "P27-E24.ts");

test("minCoins — מספר המטבעות הקטן ביותר", () => {
  assert.equal(minCoins([1, 2, 5, 10], 18), 4, "10+5+2+1");
  assert.equal(minCoins([1, 3, 4], 6), 2, "3+3 — 'החמדני' (4+1+1) נותן 3");
  assert.equal(minCoins([2], 3), -1, "אי אפשר");
  assert.equal(minCoins([5], 0), 0);
});
test("countWays — כמה צירופים (בלי חשיבות לסדר)", () => {
  assert.equal(countWays([1, 2, 5], 5), 4, "5, 2+2+1, 2+1+1+1, 1×5");
  assert.equal(countWays([2], 3), 0);
  assert.equal(countWays([1, 2], 0), 1, "סכום 0 — דרך אחת: בלי מטבעות");
});
test("סכומים גדולים — מהר (בלי רקורסיה שמחשבת שוב ושוב)", () => {
  fastEnough(() => assert.equal(minCoins([1, 5, 10, 20, 50, 100, 200], 9_999), 58), 500, "minCoins(9,999)");
  fastEnough(() => assert.equal(countWays([1, 2, 5, 10, 20, 50, 100, 200], 200), 73_682), 500, "countWays(200)");
});
