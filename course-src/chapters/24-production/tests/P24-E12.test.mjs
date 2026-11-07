import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { offsetMinutes, zonedTimeToUtc, startOfDayInZone, dayRangeInZone } = await load(import.meta.url, "P24-E12.ts");
const iso = (d) => d.toISOString();

test("offsetMinutes", () => {
  assert.equal(offsetMinutes(new Date("2026-01-15T12:00:00Z"), "Asia/Jerusalem"), 120);
  assert.equal(offsetMinutes(new Date("2026-07-15T12:00:00Z"), "Asia/Jerusalem"), 180);
  assert.equal(offsetMinutes(new Date("2026-07-15T12:00:00Z"), "America/New_York"), -240);
  assert.equal(offsetMinutes(new Date("2026-07-15T12:00:00Z"), "Asia/Kolkata"), 330, "חצי שעה — קיים");
  assert.equal(offsetMinutes(new Date("2026-07-15T12:00:00Z"), "UTC"), 0);
  assert.equal(offsetMinutes(new Date("2026-03-27T00:00:00Z"), "Asia/Jerusalem"), 180, "בדיוק ברגע המעבר");
});
test("zonedTimeToUtc — יום רגיל", () => {
  assert.equal(iso(zonedTimeToUtc("2026-11-05", "09:00", "Asia/Jerusalem")), "2026-11-05T07:00:00.000Z");
  assert.equal(iso(zonedTimeToUtc("2026-07-05", "09:00", "Asia/Jerusalem")), "2026-07-05T06:00:00.000Z");
  assert.equal(iso(zonedTimeToUtc("2026-11-05", "09:00", "America/New_York")), "2026-11-05T14:00:00.000Z");
  assert.equal(iso(zonedTimeToUtc("2026-11-05", "23:45", "UTC")), "2026-11-05T23:45:00.000Z");
});
test("startOfDayInZone", () => {
  assert.equal(iso(startOfDayInZone("2026-11-05", "Asia/Jerusalem")), "2026-11-04T22:00:00.000Z");
  assert.equal(iso(startOfDayInZone("2026-03-27", "Asia/Jerusalem")), "2026-03-26T22:00:00.000Z", "חצות לפני המעבר (02:00) — עדיין +2");
  assert.equal(iso(startOfDayInZone("2026-03-28", "Asia/Jerusalem")), "2026-03-27T21:00:00.000Z");
});
test("שעה שלא קיימת ← קדימה", () => {
  assert.equal(iso(zonedTimeToUtc("2026-03-27", "02:30", "Asia/Jerusalem")), "2026-03-27T00:30:00.000Z", "02:30 לא קיימת בישראל ב־27.3 ← 03:30");
  assert.equal(iso(startOfDayInZone("2026-03-08", "America/Havana")), "2026-03-08T05:00:00.000Z", "בקובה השעון קופץ מ־00:00 ל־01:00 — היום מתחיל ב־01:00");
});
test("שעה כפולה ← המופע הראשון", () => {
  assert.equal(iso(zonedTimeToUtc("2026-10-25", "01:30", "Asia/Jerusalem")), "2026-10-24T22:30:00.000Z");
});
test("dayRangeInZone", () => {
  const hours = (r) => (r.end - r.start) / 3600_000;
  const r = dayRangeInZone("2026-11-05", "Asia/Jerusalem");
  assert.deepEqual([iso(r.start), iso(r.end)], ["2026-11-04T22:00:00.000Z", "2026-11-05T22:00:00.000Z"]);
  assert.equal(hours(dayRangeInZone("2026-03-27", "Asia/Jerusalem")), 23, "יום המעבר לשעון קיץ — 23 שעות");
  assert.equal(hours(dayRangeInZone("2026-10-25", "Asia/Jerusalem")), 25, "חזרה לשעון חורף — 25 שעות");
  const y = dayRangeInZone("2026-12-31", "UTC");
  assert.equal(iso(y.end), "2027-01-01T00:00:00.000Z", "מעבר שנה");
});
