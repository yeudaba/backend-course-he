import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { retry, HttpError } = await load(import.meta.url, "P28-E21.ts");

test("4xx — בלי ניסיון חוזר", async () => {
  let calls = 0;
  await assert.rejects(retry(async () => { calls++; throw new HttpError(402); }, { sleep: async () => {} }));
  assert.equal(calls, 1, "תשלום שנדחה (402) — לא שולחים שוב");
});
test("לא ישנים אחרי הניסיון האחרון", async () => {
  const sleeps = [];
  await assert.rejects(retry(async () => { throw new HttpError(503); }, { retries: 2, random: () => 0.5, sleep: async (ms) => void sleeps.push(ms) }));
  assert.equal(sleeps.length, 2);
});
test("jitter — ההמתנה תלויה ב־random", async () => {
  const run = async (rnd) => {
    const sleeps = [];
    let n = 0;
    await retry(async () => { if (++n < 3) throw new Error("x"); }, { baseMs: 100, random: () => rnd, sleep: async (ms) => void sleeps.push(ms) });
    return sleeps;
  };
  assert.deepEqual(await run(0.25), [25, 50]);
  assert.deepEqual(await run(0.75), [75, 150]);
});
