import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { maxProfit } = await load(import.meta.url, "P27-E74.ts");
const brute = (p) => { let b = null; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) { const pr = p[j] - p[i]; if (pr > 0 && (!b || pr > b.profit)) b = { profit: pr, buy: i, sell: j }; } return b; };

test("דוגמאות", () => {
  assert.deepEqual(maxProfit([7, 1, 5, 3, 6, 4]), { profit: 5, buy: 1, sell: 4 });
  assert.equal(maxProfit([7, 6, 4, 3, 1]), null);
  assert.equal(maxProfit([5]), null);
  assert.equal(maxProfit([3, 3]), null);
  assert.deepEqual(maxProfit([9, 2, 8, 1, 7]), { profit: 6, buy: 1, sell: 2 }, "המקסימום אחרי המינימום, לא המקסימום הגלובלי");
  assert.deepEqual(maxProfit([1, 5, 1, 5]), { profit: 4, buy: 0, sell: 1 }, "בשוויון — המוקדם");
});
test("מול כוח גס", () => {
  const rnd = seeded(3);
  for (let t = 0; t < 300; t++) {
    const p = Array.from({ length: Math.floor(rnd() * 12) }, () => Math.floor(rnd() * 10));
    assert.deepEqual(maxProfit(p), brute(p), JSON.stringify(p));
  }
});
test("500,000 — מהר", () => {
  const rnd = seeded(9);
  const p = Array.from({ length: 500_000 }, () => Math.floor(rnd() * 1e6));
  fastEnough(() => maxProfit(p), 100, "maxProfit");
});
