// P24-E32 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRetryAfter } from "./P24-E32.ts";

const NOW = new Date("2026-10-21T07:27:00Z");

test("מספר שניות ← מילישניות", () => {
  assert.equal(parseRetryAfter("120", NOW), 120_000);
  assert.equal(parseRetryAfter("1", NOW), 1000);
  assert.equal(parseRetryAfter("0", NOW), 0);
  assert.equal(parseRetryAfter("  30 ", NOW), 30_000);
});

test("תאריך HTTP ← כמה זמן עד אליו, לפי now", () => {
  assert.equal(parseRetryAfter("Wed, 21 Oct 2026 07:28:00 GMT", NOW), 60_000);
  assert.equal(parseRetryAfter("Wed, 21 Oct 2026 08:27:00 GMT", NOW), 3_600_000);
});

test("תאריך שעבר ← 0", () => {
  assert.equal(parseRetryAfter("Wed, 21 Oct 2026 07:00:00 GMT", NOW), 0);
});

test("אין header, או header לא תקין ← null", () => {
  for (const bad of [undefined, "", "   ", "-5", "1.5", "5s", "abc", "2026-10-21", "tomorrow"]) {
    assert.equal(parseRetryAfter(bad, NOW), null, JSON.stringify(bad));
  }
});
