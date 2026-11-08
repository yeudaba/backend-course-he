import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { generateCode } = await load(import.meta.url, "P28-E10.ts");
const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };

test("קוד באורך המבוקש מ־62 התווים", async () => {
  const code = await generateCode(async () => false, { length: 7 });
  assert.match(code, /^[0-9a-zA-Z]{7}$/);
  assert.equal(await generateCode(async () => false, { length: 3, random: seq(0, 0.5, 0.999) }), "0vZ");
});
test("התנגשות ← מנסה שוב", async () => {
  const taken = new Set(["000"]);
  const tried = [];
  const code = await generateCode(async (c) => (tried.push(c), taken.has(c)), { length: 3, random: seq(0, 0, 0, 0.5, 0.5, 0.5) });
  assert.deepEqual(tried, ["000", "vvv"]);
  assert.equal(code, "vvv");
});
test("maxAttempts ← שגיאה, לא לולאה אינסופית", async () => {
  let calls = 0;
  await assert.rejects(generateCode(async () => (calls++, true), { maxAttempts: 4 }), /4/);
  assert.equal(calls, 4);
});
