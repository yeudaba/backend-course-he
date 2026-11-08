import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { nextRetry, isPermanent } = await load(import.meta.url, "P26.5-E16.ts");
const max = () => 0.999999;
const half = () => 0.5;
const tmp = new Error("ECONNRESET");

test("התקרה מכפילה את עצמה: 500, 1000, 2000… עד maxMs", () => {
  assert.deepEqual([1, 2, 3, 4].map((a) => nextRetry(a, tmp, { random: max, maxAttempts: 10 }).delayMs), [499, 999, 1999, 3999]);
  assert.equal(nextRetry(9, tmp, { random: max, maxAttempts: 10 }).delayMs, 29999, "לא יותר מ־maxMs");
});
test("jitter: אקראי בין 0 לתקרה", () => {
  assert.equal(nextRetry(3, tmp, { random: half }).delayMs, 1000);
  assert.equal(nextRetry(3, tmp, { random: () => 0 }).delayMs, 0);
  const many = new Set(Array.from({ length: 50 }, () => nextRetry(4, tmp).delayMs));
  assert.ok(many.size > 20, "בלי random מוזרק — Math.random");
});
test("אחרי maxAttempts ← dead-letter", () => {
  assert.deepEqual(nextRetry(5, tmp), { action: "dead-letter", reason: "max-attempts" });
  assert.equal(nextRetry(4, tmp).action, "retry");
});
test("שגיאה קבועה ← dead-letter מיד", () => {
  for (const err of [{ status: 400 }, { status: 404 }, { status: 422 }, Object.assign(new Error("bad"), { permanent: true })]) {
    assert.deepEqual(nextRetry(1, err), { action: "dead-letter", reason: "permanent" }, JSON.stringify(err));
  }
  for (const err of [{ status: 408 }, { status: 429 }, { status: 500 }, { status: 503 }, tmp]) assert.equal(isPermanent(err), false);
});
test("429 עם retryAfterMs ← לא פחות ממה שביקשו (ולא מעל maxMs)", () => {
  assert.equal(nextRetry(1, { status: 429, retryAfterMs: 5000 }, { random: half }).delayMs, 5000);
  assert.equal(nextRetry(1, { status: 429, retryAfterMs: 99999 }, { random: half }).delayMs, 30000);
  assert.equal(nextRetry(6, { status: 429, retryAfterMs: 10 }, { random: half, maxAttempts: 10 }).delayMs, 8000);
});
