// P22-E22 — מתוקן: כל בדיקה קובעת בעצמה "מה השעה"
import { test } from "node:test";
import assert from "node:assert/strict";
import { daysLeftInMonth, isWeekend } from "./P22-E22.ts";

const at = (iso: string) => new Date(iso);


test("סוף שבוע — שישי ושבת, לפי UTC", () => {
  assert.equal(isWeekend(at("2026-11-06T12:00:00Z")), true); // שישי
  assert.equal(isWeekend(at("2026-11-07T12:00:00Z")), true); // שבת
  assert.equal(isWeekend(at("2026-11-08T12:00:00Z")), false); // ראשון
  assert.equal(isWeekend(at("2026-11-05T22:30:00Z")), false); // חמישי ב־UTC (ובישראל כבר שישי)
});
