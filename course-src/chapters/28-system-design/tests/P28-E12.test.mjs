import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { retry, HttpError } = await load(import.meta.url, "P28-E12.ts");
const fake = () => { const sleeps = []; return { sleeps, sleep: async (ms) => void sleeps.push(ms) }; };

test("מצליח אחרי כישלונות; backoff עם jitter", async () => {
  const s = fake();
  let n = 0;
  const r = await retry(async () => { if (++n < 3) throw new Error("ECONNRESET"); return "ok"; }, { retries: 5, baseMs: 100, random: () => 0.5, sleep: s.sleep });
  assert.equal(r, "ok");
  assert.deepEqual(s.sleeps, [50, 100], "random=0.5: חצי מ־100, חצי מ־200");
});
test("תקרה maxMs", async () => {
  const s = fake();
  await assert.rejects(retry(async () => { throw new Error("x"); }, { retries: 5, baseMs: 100, maxMs: 300, random: () => 0.999, sleep: s.sleep }));
  assert.deepEqual(s.sleeps, [99, 199, 299, 299, 299]);
});
test("לא ישנים אחרי הניסיון האחרון; זורקים את השגיאה המקורית", async () => {
  const s = fake();
  const err = new Error("down");
  let calls = 0;
  await assert.rejects(retry(async () => { calls++; throw err; }, { retries: 2, random: () => 0, sleep: s.sleep }), (e) => e === err);
  assert.equal(calls, 3);
  assert.equal(s.sleeps.length, 2);
});
test("4xx (חוץ מ־429) — בלי ניסיון חוזר; 5xx ו־429 — כן", async () => {
  for (const [status, expectedCalls] of [[400, 1], [404, 1], [409, 1], [429, 3], [503, 3]]) {
    let calls = 0;
    await assert.rejects(retry(async () => { calls++; throw new HttpError(status); }, { retries: 2, sleep: async () => {} }));
    assert.equal(calls, expectedCalls, `status ${status}`);
  }
});
