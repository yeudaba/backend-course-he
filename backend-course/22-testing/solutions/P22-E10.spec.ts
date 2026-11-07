// P22-E10 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { dueStatus } from "./P22-E10.ts";

const now = new Date("2026-11-04T10:00:00Z");

test("כל המצבים, והגבולות", () => {
  assert.equal(dueStatus(null, now), "none");
  assert.equal(dueStatus("2026-11-03", now), "overdue");
  assert.equal(dueStatus("2026-11-04", now), "today");
  assert.equal(dueStatus("2026-11-05", now), "soon");
  assert.equal(dueStatus("2026-11-07", now), "soon"); // בדיוק 3 ימים
  assert.equal(dueStatus("2026-11-08", now), "later");
});

test("\"היום\" לפי UTC — גם כשבישראל כבר מחר", () => {
  const lateNight = new Date("2026-11-04T23:30:00Z"); // 01:30 ב־5 בנובמבר בישראל
  assert.equal(dueStatus("2026-11-04", lateNight), "today");
});
