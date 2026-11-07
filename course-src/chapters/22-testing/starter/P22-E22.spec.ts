// P22-E22: הבדיקות האלה עוברות "היום" — ונכשלות בחלק מימות השנה. תקן אותן כך שיעברו תמיד
import { test } from "node:test";
import assert from "node:assert/strict";
import { daysLeftInMonth, isWeekend } from "./P22-E22.ts";

test("ימים עד סוף החודש", () => {
  assert.equal(daysLeftInMonth(), 30 - new Date().getUTCDate());
});

test("סוף שבוע", () => {
  const today = new Date().getDay();
  assert.equal(isWeekend(), today === 5 || today === 6);
});
