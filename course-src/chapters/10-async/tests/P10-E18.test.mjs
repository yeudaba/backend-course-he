import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { processInOrder } = await load(import.meta.url, "P10-E18.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("ברצף ובסדר", async () => {
  const log = [];
  const r = await processInOrder([1, 2, 3], async (n) => { log.push(`s${n}`); await sleep(15 - n * 4); log.push(`e${n}`); return n * 10; });
  assert.deepEqual(r, [10, 20, 30]);
  assert.deepEqual(log, ["s1", "e1", "s2", "e2", "s3", "e3"]);
});
test("עוצר בכישלון", async () => {
  const seen = [];
  await assert.rejects(processInOrder([1, 2, 3], async (n) => { seen.push(n); if (n === 2) throw new Error("x"); }), { message: "x" });
  assert.deepEqual(seen, [1, 2]);
});
