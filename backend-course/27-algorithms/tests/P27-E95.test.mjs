import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { MinHeap, topK } = await load(import.meta.url, "P27-E95.ts");

test("MinHeap — מוציא בסדר עולה", () => {
  const h = new MinHeap();
  assert.equal(h.pop(), undefined);
  const rnd = seeded(5);
  const vals = Array.from({ length: 500 }, () => Math.floor(rnd() * 100) - 50);
  for (const v of vals) h.push(v);
  assert.equal(h.size, 500);
  assert.equal(h.peek(), Math.min(...vals));
  const out = [];
  while (h.size) out.push(h.pop());
  assert.deepEqual(out, vals.toSorted((a, b) => a - b));
});
test("topK", () => {
  assert.deepEqual(topK([5, 1, 9, 3, 9, 7], 3), [9, 9, 7]);
  assert.deepEqual(topK([2, 1], 5), [2, 1]);
  assert.deepEqual(topK([], 3), []);
  assert.deepEqual(topK([1, 2, 3], 0), []);
  function* gen() { for (let i = 0; i < 10; i++) yield i; }
  assert.deepEqual(topK(gen(), 2), [9, 8], "Iterable, לא רק מערך");
});
test("2,000,000 ערכים, k=10 — מהר", () => {
  const rnd = seeded(11);
  const vals = Array.from({ length: 2_000_000 }, () => rnd());
  const r = fastEnough(() => topK(vals, 10), 300, "topK על 2,000,000");
  assert.deepEqual(r, vals.toSorted((a, b) => b - a).slice(0, 10));
});
