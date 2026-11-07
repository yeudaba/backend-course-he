import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { memoizeAsync } = await load(import.meta.url, "P10-E25.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("בקשות מקבילות — קריאה אחת", async () => {
  let calls = 0;
  const f = memoizeAsync(async (k) => { calls++; await sleep(10); return k * 2; }, 1000);
  assert.deepEqual(await Promise.all([f(5), f(5), f(5)]), [10, 10, 10]);
  assert.equal(calls, 1);
  await f(5);
  assert.equal(calls, 1);
  await f(6);
  assert.equal(calls, 2);
});
test("TTL פג", async () => {
  let calls = 0;
  const f = memoizeAsync(async () => ++calls, 20);
  await f("a");
  await sleep(30);
  assert.equal(await f("a"), 2);
});
test("כישלון לא נשמר", async () => {
  let calls = 0;
  const f = memoizeAsync(async () => { calls++; if (calls === 1) throw new Error("x"); return "ok"; }, 1000);
  await assert.rejects(f("k"), { message: "x" });
  assert.equal(await f("k"), "ok");
});
