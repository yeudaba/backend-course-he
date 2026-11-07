import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createInvoiceNumberer } = await load(import.meta.url, "P22-E13.ts");

test("קבוע לגמרי עם שעון ואקראיות מוזרקים", () => {
  assert.equal(typeof createInvoiceNumberer, "function", "צריך לייצא createInvoiceNumberer");
  const next = createInvoiceNumberer({ now: () => new Date("2026-11-07T10:00:00Z"), random: () => 0.0421 });
  assert.equal(next(), "INV-202611-0001-042");
  assert.equal(next(), "INV-202611-0002-042");
});
test("UTC: 30 בנובמבר 23:30 UTC (בישראל כבר דצמבר) ← 202611", () => {
  const next = createInvoiceNumberer({ now: () => new Date("2026-11-30T23:30:00Z"), random: () => 0.9999 });
  assert.equal(next(), "INV-202611-0001-999");
});
test("כל מופע סופר לבד", () => {
  const deps = { now: () => new Date("2026-01-05T08:00:00Z"), random: () => 0 };
  const a = createInvoiceNumberer(deps);
  const b = createInvoiceNumberer(deps);
  a();
  a();
  assert.equal(b(), "INV-202601-0001-000");
  assert.equal(a(), "INV-202601-0003-000");
});
test("בלי פרמטרים — ברירות מחדל אמיתיות", () => {
  assert.match(createInvoiceNumberer()(), /^INV-\d{6}-0001-\d{3}$/);
});
