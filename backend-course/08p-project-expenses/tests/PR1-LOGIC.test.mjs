import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const m = await load(import.meta.url, "expenses-cli/src/expenses.js", { step: "שלב 1", exports: "את פונקציות הלוגיקה (isValidDate, addExpense, monthlySummary ועוד)" });
const base = () => [
  { id: 1, date: "2026-10-01", category: "food", amount: 54.5, note: "lunch" },
  { id: 2, date: "2026-10-03", category: "transport", amount: 12, note: "" },
  { id: 5, date: "2026-11-02", category: "food", amount: 31.2, note: "" },
];

test("expenseError", () => { const e = m.expenseError("X", "msg"); assert.ok(e instanceof Error, "expenseError צריכה להחזיר new Error(message) עם שדה code — וקיבלנו משהו שאינו Error"); assert.equal(e.code, "X"); assert.equal(e.message, "msg"); });
test("isValidDate", () => {
  for (const d of ["2026-10-01", "2024-02-29", "2026-12-31"]) assert.equal(m.isValidDate(d), true, d);
  for (const d of ["2026-02-30", "2026-13-01", "2026-1-5", "abc", "2026-10-00", ""]) assert.equal(m.isValidDate(d), false, d);
  assert.equal(m.isValidDate("2000-02-29"), true, "2000 — שנה מעוברת (מתחלקת ב־400)");
  assert.equal(m.isValidDate("2100-02-29"), false, "2100 — לא מעוברת (מתחלקת ב־100 ולא ב־400)");
});
test("parseAmount", () => {
  assert.equal(m.parseAmount("54.5"), 54.5);
  assert.equal(m.parseAmount(" 12.345 "), 12.35);
  for (const bad of ["", "abc", "0", "-3", "12abc"]) assert.throws(() => m.parseAmount(bad), { code: "INVALID_AMOUNT" }, JSON.stringify(bad));
});
test("nextId", () => { assert.equal(m.nextId([]), 1); assert.equal(m.nextId(base()), 6); });
test("addExpense מוסיף בלי לשנות את המקור", () => {
  const list = base();
  const r = m.addExpense(list, { date: "2026-10-09", category: " Food ", amount: "20", note: " coffee " });
  assert.deepEqual(r[3], { id: 6, date: "2026-10-09", category: "food", amount: 20, note: "coffee" });
  assert.equal(list.length, 3);
  assert.equal(m.addExpense([], { date: "2026-10-09", category: "x", amount: 1 })[0].note, "");
});
test("addExpense — שגיאות", () => {
  assert.throws(() => m.addExpense([], { date: "2026-02-30", category: "x", amount: 1 }), { code: "INVALID_DATE" });
  assert.throws(() => m.addExpense([], { date: "2026-02-01", category: "  ", amount: 1 }), { code: "INVALID_CATEGORY", message: "חובה לציין קטגוריה" });
  assert.throws(() => m.addExpense([], { date: "2026-02-01", category: "x", amount: "abc" }), { code: "INVALID_AMOUNT" });
});
test("removeExpense", () => {
  const list = base();
  assert.deepEqual(m.removeExpense(list, "2").map((e) => e.id), [1, 5]);
  assert.equal(list.length, 3);
  assert.throws(() => m.removeExpense(list, 99), { code: "NOT_FOUND", message: "לא נמצאה הוצאה עם מזהה 99" });
});
test("filterExpenses", () => {
  assert.deepEqual(m.filterExpenses(base(), { category: "FOOD" }).map((e) => e.id), [1, 5]);
  assert.deepEqual(m.filterExpenses(base(), { month: "2026-10" }).map((e) => e.id), [1, 2]);
  assert.deepEqual(m.filterExpenses(base(), { category: "food", month: "2026-11" }).map((e) => e.id), [5]);
  assert.equal(m.filterExpenses(base()).length, 3);
});
test("monthlySummary", () => {
  assert.deepEqual(m.monthlySummary(base(), "2026-10"), { month: "2026-10", count: 2, total: 66.5, byCategory: { food: 54.5, transport: 12 }, topCategory: "food" });
  const many = [{ id: 1, date: "2026-10-01", category: "food", amount: 10, note: "" }, { id: 2, date: "2026-10-02", category: "rent", amount: 900, note: "" }];
  assert.equal(m.monthlySummary(many, "2026-10").topCategory, "rent", "topCategory — הקטגוריה עם הסכום הגבוה, לא הראשונה");
  assert.deepEqual(m.monthlySummary(base(), "2025-01"), { month: "2025-01", count: 0, total: 0, byCategory: {}, topCategory: null });
});
test("formatExpenses", () => {
  assert.equal(m.formatExpenses([]), "אין הוצאות להצגה");
  const lines = m.formatExpenses([base()[1], base()[0]]).split("\n");
  assert.equal(lines[0], "#1   2026-10-01  food             54.50  lunch");
  assert.equal(lines[1], "#2   2026-10-03  transport        12.00");
});
test("formatSummary", () => {
  assert.equal(m.formatSummary(m.monthlySummary(base(), "2026-10")), "סיכום 2026-10: 2 הוצאות, סה״כ 66.50\n  food             54.50\n  transport        12.00");
});
