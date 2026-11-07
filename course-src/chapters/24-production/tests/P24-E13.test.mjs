import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { addLocalDays, isSameLocalDay, daysUntil } = await load(import.meta.url, "P24-E13.ts");
const d = (s) => new Date(s);
const iso = (x) => x.toISOString();
const IL = "Asia/Jerusalem";

test("addLocalDays — יום רגיל", () => {
  assert.equal(iso(addLocalDays(d("2026-11-04T07:00:00Z"), 1, IL)), "2026-11-05T07:00:00.000Z");
  assert.equal(iso(addLocalDays(d("2026-11-04T07:00:00Z"), 30, IL)), "2026-12-04T07:00:00.000Z");
  assert.equal(iso(addLocalDays(d("2026-12-31T22:30:00Z"), 1, "UTC")), "2027-01-01T22:30:00.000Z");
});
test("addLocalDays — דרך מעבר שעון", () => {
  // 09:00 בישראל ב־26.3 (חורף) ← 09:00 ב־27.3 (קיץ): רק 23 שעות
  assert.equal(iso(addLocalDays(d("2026-03-26T07:00:00Z"), 1, IL)), "2026-03-27T06:00:00.000Z");
  assert.equal(iso(addLocalDays(d("2026-10-24T06:00:00Z"), 1, IL)), "2026-10-25T07:00:00.000Z", "סתיו: 25 שעות");
  assert.equal(iso(addLocalDays(d("2026-03-27T06:00:00Z"), -1, IL)), "2026-03-26T07:00:00.000Z", "גם אחורה");
  assert.equal(iso(addLocalDays(d("2026-03-26T00:30:00Z"), 1, IL)), "2026-03-27T00:30:00.000Z", "02:30 לא קיימת ב־27.3 ← 03:30");
});
test("isSameLocalDay", () => {
  assert.equal(isSameLocalDay(d("2026-11-04T21:00:00Z"), d("2026-11-04T23:00:00Z"), "UTC"), true);
  assert.equal(isSameLocalDay(d("2026-11-04T21:00:00Z"), d("2026-11-04T23:00:00Z"), IL), false, "23:00 מול 01:00 למחרת");
  assert.equal(isSameLocalDay(d("2026-11-04T23:00:00Z"), d("2026-11-05T21:30:00Z"), IL), true);
  assert.equal(isSameLocalDay(d("2026-11-04T10:00:00Z"), d("2025-11-04T10:00:00Z"), IL), false, "אותו יום וחודש, שנה אחרת");
});
test("daysUntil", () => {
  const now = d("2026-11-04T22:30:00Z"); // ישראל: 5.11 00:30 · UTC: 4.11
  assert.equal(daysUntil("2026-11-05", now, IL), 0);
  assert.equal(daysUntil("2026-11-05", now, "UTC"), 1);
  assert.equal(daysUntil("2026-11-04", now, IL), -1);
  assert.equal(daysUntil("2026-12-05", now, IL), 30);
  assert.equal(daysUntil("2026-03-28", d("2026-03-26T10:00:00Z"), IL), 2, "דרך מעבר שעון — עדיין ימים שלמים");
  assert.equal(daysUntil("2027-01-01", d("2026-12-31T12:00:00Z"), "UTC"), 1);
});
