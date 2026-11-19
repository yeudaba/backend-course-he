import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P07-E83.js";
const get = () => exportsOf(import.meta.url, FILE, ["daysBetween"]);

test("ימים שלמים בין שני זמנים", async () => {
  const { daysBetween } = await get();
  assert.equal(daysBetween("2026-11-01T10:00:00Z", "2026-11-19T10:00:00Z"), 18);
  assert.equal(daysBetween("2026-11-01T10:00:00Z", "2026-11-19T09:00:00Z"), 17, "17 ימים ו־23 שעות הם 17 ימים שלמים (Math.floor)");
  assert.equal(daysBetween("2026-11-01T10:00:00Z", "2026-11-01T22:00:00Z"), 0, "חצי יום ← 0");
  assert.equal(daysBetween("2026-12-31T00:00:00Z", "2027-01-02T00:00:00Z"), 2, "מעבר שנה");
  assert.equal(daysBetween("2026-11-01T10:00:00+02:00", "2026-11-02T08:00:00Z"), 1, "זמן עם offset");
});
test("שלילי כשהשני לפני הראשון", async () => {
  const { daysBetween } = await get();
  assert.equal(daysBetween("2026-11-19T10:00:00Z", "2026-11-01T10:00:00Z"), -18);
});
test("תאריך לא תקין ← null", async () => {
  const { daysBetween } = await get();
  assert.equal(daysBetween("2026-11-01T10:00:00Z", "מחר"), null);
  assert.equal(daysBetween("31/12/2026", "2026-11-01T10:00:00Z"), null);
  assert.equal(daysBetween("", ""), null);
});
