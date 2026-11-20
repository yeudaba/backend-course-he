// P26.5-E27 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "./P26.5-E27.ts";

const temporary = { retryable: true, message: "connection reset" };
const permanent = { retryable: false, message: "product 99 not found" };

test("השהיה שמכפילה את עצמה: 1000, 2000, 4000", () => {
  assert.deepEqual(decide(1, 10, temporary), { action: "retry", delayMs: 1000 });
  assert.deepEqual(decide(2, 10, temporary), { action: "retry", delayMs: 2000 });
  assert.deepEqual(decide(3, 10, temporary), { action: "retry", delayMs: 4000 });
});

test("תקרה של 60 שניות", () => {
  assert.deepEqual(decide(6, 20, temporary), { action: "retry", delayMs: 32_000 });
  assert.deepEqual(decide(7, 20, temporary), { action: "retry", delayMs: 60_000 });
  assert.deepEqual(decide(19, 20, temporary), { action: "retry", delayMs: 60_000 });
});


test("שגיאה קבועה ← dead-letter מיד", () => {
  const d = decide(1, 5, permanent);
  assert.equal(d.action, "dead-letter");
  assert.ok(d.action === "dead-letter" && d.reason.includes("product 99 not found"));
});

test("attempt לא תקין ← RangeError", () => {
  for (const bad of [0, -1, 1.5, NaN]) assert.throws(() => decide(bad, 5, temporary), RangeError, String(bad));
});
