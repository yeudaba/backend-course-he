import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mapLimit } = await load(import.meta.url, "P10-E24.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("תוצאות בסדר ובמגבלה", async () => {
  let active = 0, max = 0;
  const r = await mapLimit([5, 1, 4, 2, 3, 1], 2, async (n, i) => { active++; max = Math.max(max, active); await sleep(n * 5); active--; return `${i}:${n}`; });
  assert.deepEqual(r, ["0:5", "1:1", "2:4", "3:2", "4:3", "5:1"]);
  assert.equal(max, 2);
});
test("מנצל את המגבלה (לא במנות)", async () => {
  const t = Date.now();
  await mapLimit([60, 10, 10, 10, 10], 2, (ms) => sleep(ms));
  assert.ok(Date.now() - t < 85, `לקח ${Date.now() - t}ms`);
});
test("ריק ו־limit גדול", async () => { assert.deepEqual(await mapLimit([], 3, async (x) => x), []); assert.deepEqual(await mapLimit([1, 2], 10, async (x) => x * 2), [2, 4]); });
