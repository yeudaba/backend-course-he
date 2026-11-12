import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { countSubarraysWithSum } = await load(import.meta.url, "P27-E50.ts");
const brute = (a, k) => { let c = 0; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (s === k) c++; } } return c; };

test("דוגמאות", () => {
  assert.equal(countSubarraysWithSum([1, 1, 1], 2), 2);
  assert.equal(countSubarraysWithSum([3, 4, 7, 2, -3, 1, 4, 2], 7), 4);
  assert.equal(countSubarraysWithSum([0, 0, 0], 0), 6);
  assert.equal(countSubarraysWithSum([], 0), 0);
  assert.equal(countSubarraysWithSum([5], 5), 1);
});
test("מול כוח גס על קלטים אקראיים", () => {
  const rnd = seeded(7);
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: Math.floor(rnd() * 30) }, () => Math.floor(rnd() * 11) - 5);
    const k = Math.floor(rnd() * 11) - 5;
    assert.equal(countSubarraysWithSum(a, k), brute(a, k), JSON.stringify({ a, k }));
  }
});
test("200,000 — מהר", () => {
  const rnd = seeded(1);
  const a = Array.from({ length: 200_000 }, () => Math.floor(rnd() * 21) - 10);
  fastEnough(() => countSubarraysWithSum(a, 3), 200, "countSubarraysWithSum");
});
