import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { today, tomorrowSameTime, isOverdue } = await load(import.meta.url, "P24-E21.ts");
const IL = "Asia/Jerusalem";
const d = (s) => new Date(s);

test("today", () => {
  assert.equal(today(d("2026-11-04T22:30:00Z"), IL), "2026-11-05", "00:30 בישראל");
  assert.equal(today(d("2026-11-04T12:00:00Z"), IL), "2026-11-04");
  assert.equal(today(d("2026-11-04T22:30:00Z"), "UTC"), "2026-11-04");
});
test("tomorrowSameTime", () => {
  assert.equal(tomorrowSameTime(d("2026-11-04T07:00:00Z"), IL).toISOString(), "2026-11-05T07:00:00.000Z");
  assert.equal(tomorrowSameTime(d("2026-03-26T07:00:00Z"), IL).toISOString(), "2026-03-27T06:00:00.000Z", "09:00 ← 09:00, גם ביום המעבר");
  assert.equal(tomorrowSameTime(d("2026-10-24T06:00:00Z"), IL).toISOString(), "2026-10-25T07:00:00.000Z");
});
test("isOverdue", () => {
  assert.equal(isOverdue("2026-11-05", d("2026-11-05T10:00:00Z"), IL), false, "ביום עצמו — עוד לא באיחור");
  assert.equal(isOverdue("2026-11-05", d("2026-11-05T21:30:00Z"), IL), false, "23:30 בישראל — עדיין היום");
  assert.equal(isOverdue("2026-11-05", d("2026-11-05T22:30:00Z"), IL), true, "00:30 ב־6.11 — באיחור");
  assert.equal(isOverdue("2026-11-05", d("2026-11-05T22:30:00Z"), "UTC"), false);
});
