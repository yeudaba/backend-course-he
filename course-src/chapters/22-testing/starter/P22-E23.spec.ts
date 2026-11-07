// P22-E23: הבדיקה הזו בודקת "איך" ולא "מה" — היא נשברת כשמישהו משפר את הקוד, ולא תופסת באגים אמיתיים. כתוב אותה מחדש
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { monthlyReport } from "./P22-E23.ts";

test("דוח חודשי", async () => {
  const repo = { findByMonth: mock.fn(async () => [{ category: "coffee", amount: 10 }]) };
  await monthlyReport(repo, 2026, 11);
  assert.equal(repo.findByMonth.mock.callCount(), 1);
  assert.deepEqual(repo.findByMonth.mock.calls[0].arguments, [2026, 11]);
});
