import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { retry, backoffDelays, isRetryable, HttpStatusError } = await load(import.meta.url, "P25-E19.ts");

test("isRetryable", () => {
  for (const s of [500, 502, 503, 429]) assert.equal(isRetryable(new HttpStatusError(s)), true, String(s));
  for (const s of [400, 401, 403, 404, 422]) assert.equal(isRetryable(new HttpStatusError(s)), false, String(s));
  assert.equal(isRetryable(Object.assign(new Error("socket hang up"), { code: "ECONNRESET" })), true);
});
test("backoffDelays — אקספוננציאלי, עם תקרה ו־jitter", () => {
  assert.deepEqual(backoffDelays({ retries: 6, baseMs: 100, maxMs: 1000, random: () => 0.999999 }), [99, 199, 399, 799, 999, 999]);
  assert.deepEqual(backoffDelays({ retries: 3, baseMs: 100, maxMs: 1000, random: () => 0.5 }), [50, 100, 200]);
  assert.deepEqual(backoffDelays({ retries: 2, baseMs: 100, maxMs: 1000, random: () => 0 }), [0, 0]);
});
test("retry: מצליח אחרי כישלונות, עם ההמתנות הנכונות", async () => {
  const waited = [];
  const r = await retry(async (n) => { if (n < 3) throw new HttpStatusError(503); return `ok on ${n}`; }, { retries: 4, baseMs: 100, maxMs: 1000, random: () => 0.5, sleep: async (ms) => waited.push(ms) });
  assert.equal(r, "ok on 3");
  assert.deepEqual(waited, [50, 100]);
});
test("retry: מוותר אחרי retries — עם השגיאה האחרונה", async () => {
  let n = 0;
  await assert.rejects(retry(async () => { n++; throw new HttpStatusError(502); }, { retries: 2, sleep: async () => {} }), { status: 502 });
  assert.equal(n, 3, "ניסיון אחד + 2 חוזרים");
});
test("retry: 4xx — מיד, בלי לחכות", async () => {
  let n = 0;
  await assert.rejects(retry(async () => { n++; throw new HttpStatusError(422); }, { retries: 5, sleep: async () => assert.fail("לא מחכים") }), { status: 422 });
  assert.equal(n, 1);
});
