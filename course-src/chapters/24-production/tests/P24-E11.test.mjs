import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { isValidTimeZone, localDate, localTime, isPastInZone } = await load(import.meta.url, "P24-E11.ts");
const d = (s) => new Date(s);

test("isValidTimeZone", () => {
  for (const tz of ["UTC", "Asia/Jerusalem", "America/New_York", "Europe/London"]) assert.equal(isValidTimeZone(tz), true, tz);
  for (const tz of ["", "Mars/Olympus", "Israel Time", "GMT+25"]) assert.equal(isValidTimeZone(tz), false, tz);
});
test("localDate — אותו רגע, תאריכים שונים", () => {
  const instant = d("2026-11-04T22:30:00Z");
  assert.equal(localDate(instant, "UTC"), "2026-11-04");
  assert.equal(localDate(instant, "Asia/Jerusalem"), "2026-11-05");
  assert.equal(localDate(instant, "America/New_York"), "2026-11-04");
  assert.equal(localDate(d("2026-11-05T03:00:00Z"), "America/Los_Angeles"), "2026-11-04");
  assert.equal(localDate(d("2026-01-01T00:00:00Z"), "Asia/Tokyo"), "2026-01-01");
});
test("localTime — HH:mm, כולל שעון קיץ", () => {
  assert.equal(localTime(d("2026-11-04T22:30:00Z"), "Asia/Jerusalem"), "00:30");
  assert.equal(localTime(d("2026-07-04T22:30:00Z"), "Asia/Jerusalem"), "01:30", "בקיץ ישראל ב־UTC+3");
  assert.equal(localTime(d("2026-11-04T09:05:00Z"), "UTC"), "09:05");
});
test("isPastInZone", () => {
  const now = d("2026-11-04T22:30:00Z");
  assert.equal(isPastInZone("2026-11-04", now, "Asia/Jerusalem"), true, "בישראל כבר 5 בנובמבר");
  assert.equal(isPastInZone("2026-11-04", now, "UTC"), false, "היום — לא עבר");
  assert.equal(isPastInZone("2026-11-03", now, "UTC"), true);
  assert.equal(isPastInZone("2026-11-05", now, "Asia/Jerusalem"), false);
  assert.equal(isPastInZone("2025-12-31", now, "Pacific/Kiritimati"), true);
});
