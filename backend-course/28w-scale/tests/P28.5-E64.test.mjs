import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { batches } = await load(import.meta.url, "P28.5-E64.ts");
const all = async (it) => { const out = []; for await (const x of it) out.push(x); return out; };

test("מחלק לפי הסדר", async () => {
  assert.deepEqual(await all(batches([1, 2, 3, 4, 5, 6, 7], 3)), [[1, 2, 3], [4, 5, 6], [7]]);
  assert.deepEqual(await all(batches([1, 2, 3, 4], 2)), [[1, 2], [3, 4]]);
  assert.deepEqual(await all(batches([], 5)), []);
  async function* src() { for (let i = 0; i < 5; i++) yield `r${i}`; }
  assert.deepEqual(await all(batches(src(), 10)), [["r0", "r1", "r2", "r3", "r4"]]);
});
test("עצל — לא קורא יותר מהצורך", async () => {
  let read = 0;
  async function* src() { for (let i = 0; i < 1000; i++) { read++; yield i; } }
  const it = batches(src(), 10);
  const first = await it.next();
  assert.deepEqual(first.value, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.ok(read <= 11, `נקראו ${read} איברים בשביל batch אחד`);
  await it.return();
});
test("batch קודם לא משתנה", async () => {
  const got = [];
  for await (const b of batches([1, 2, 3, 4], 2)) got.push(b);
  assert.deepEqual(got, [[1, 2], [3, 4]]);
});
test("size לא תקין", async () => {
  await assert.rejects(all(batches([1], 0)), RangeError);
  await assert.rejects(all(batches([1], 2.5)), RangeError);
});
