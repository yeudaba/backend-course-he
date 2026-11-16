import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { splitStock, takeOne } = await load(import.meta.url, "P28-E93.ts");

test("splitStock", () => {
  assert.deepEqual(splitStock(10, 3), [4, 3, 3]);
  assert.deepEqual(splitStock(100, 10), Array(10).fill(10));
  assert.deepEqual(splitStock(2, 5), [1, 1, 0, 0, 0]);
  assert.deepEqual(splitStock(0, 2), [0, 0]);
  assert.deepEqual(splitStock(17, 4), [5, 4, 4, 4]);
  for (const [t, p] of [[10, 0], [10, 1.5], [-1, 2], [2.5, 2]]) assert.throws(() => splitStock(t, p), RangeError, `${t}, ${p}`);
});
test("takeOne — במעגל, ו־-1 כשהכול ריק", () => {
  const s = [1, 0, 2];
  assert.equal(takeOne(s, 1), 2);
  assert.deepEqual(s, [1, 0, 1]);
  assert.equal(takeOne(s, 5), 2);
  assert.equal(takeOne(s, 2), 0);
  assert.deepEqual(s, [0, 0, 0]);
  assert.equal(takeOne(s, 0), -1);
  assert.deepEqual(s, [0, 0, 0]);
});
test("לא מוכרים יותר מהמלאי", () => {
  const s = splitStock(25, 4);
  let sold = 0;
  for (let i = 0; i < 100; i++) if (takeOne(s, i * 7) !== -1) sold++;
  assert.equal(sold, 25);
});
