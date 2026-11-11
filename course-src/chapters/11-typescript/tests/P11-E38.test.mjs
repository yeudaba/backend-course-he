import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E38.ts";
const get = () => exportsOf(import.meta.url, FILE, ["daysBetween", "isWeekend"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימות: Date", () => {
  const r = typeProbe(import.meta.url, FILE, `import { daysBetween, isWeekend } from "FILE";
const n: number = daysBetween(new Date(), new Date());
const b: boolean = isWeekend(new Date());
// @ts-expect-error — daysBetween מקבלת Date, לא מחרוזת
daysBetween("2026-01-01", new Date());
// @ts-expect-error — isWeekend מחזירה boolean
const s: string = isWeekend(new Date());
export { n, b, s };
`);
  assert.ok(r.ok, r.message);
});
test("daysBetween — ימים שלמים, גם שלילי", async () => {
  const { daysBetween } = await get();
  assert.equal(daysBetween(new Date("2026-01-01"), new Date("2026-01-31")), 30);
  assert.equal(daysBetween(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-02T23:00:00Z")), 1, "יום ו־23 שעות ← 1");
  assert.equal(daysBetween(new Date("2026-01-31"), new Date("2026-01-01T12:00:00Z")), -29, "‎-29.5 ימים ← ‎-29 (חיתוך לכיוון 0)");
  assert.equal(daysBetween(new Date("2026-03-01"), new Date("2026-03-01")), 0);
  assert.equal(daysBetween(new Date("2024-01-01"), new Date("2025-01-01")), 366);
});
test("isWeekend — שישי ושבת", async () => {
  const { isWeekend } = await get();
  const days = [9, 10, 11, 12, 13, 14, 15].map((d) => isWeekend(new Date(2026, 10, d)));
  assert.deepEqual(days, [false, false, false, false, true, true, false], "9.11.2026 הוא יום שני; 13 — שישי, 14 — שבת");
});
