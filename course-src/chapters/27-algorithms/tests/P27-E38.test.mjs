import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";
import { code as clean } from "./_ts.mjs";

const { FastQueue } = await load(import.meta.url, "P27-E38.ts");

test("FIFO, peek, size, ריק", () => {
  const q = new FastQueue();
  assert.equal(q.shift(), undefined);
  assert.equal(q.peek(), undefined);
  q.push(1); q.push(2); q.push(3);
  assert.equal(q.size, 3);
  assert.equal(q.peek(), 1);
  assert.equal(q.shift(), 1);
  q.push(4);
  assert.deepEqual([q.shift(), q.shift(), q.shift(), q.shift()], [2, 3, 4, undefined]);
  assert.equal(q.size, 0);
  q.push(0);
  assert.equal(q.shift(), 0, "0 הוא ערך");
});
test("300,000 מעורבבים — מהר, ובלי Array.prototype.shift", () => {
  assert.doesNotMatch(clean(import.meta.url, "P27-E38.ts"), /\.shift\(/, "בלי shift של מערך — O(n) לכל קריאה");
  const q = new FastQueue();
  let sum = 0;
  fastEnough(() => {
    for (let i = 0; i < 300_000; i++) {
      q.push(i);
      q.push(i);
      sum += q.shift();
    }
    while (q.size) sum += q.shift();
  }, 300, "FastQueue");
  assert.equal(sum, 2 * (299_999 * 300_000) / 2);
});
