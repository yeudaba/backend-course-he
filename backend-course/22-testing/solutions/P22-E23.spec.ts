// P22-E23 — כתוב מחדש: fake עם נתונים, ובודקים את התוצאה
import { test } from "node:test";
import assert from "node:assert/strict";
import { monthlyReport, type Sale, type SalesRepository } from "./P22-E23.ts";

// fake אמיתי: מחזיר רק מכירות של החודש שביקשו. לא אכפת לו כמה פעמים קוראים לו
function fakeRepo(data: Record<string, Sale[]>): SalesRepository {
  return { findByMonth: async (year, month) => data[`${year}-${month}`] ?? [] };
}

test("סיכום לפי קטגוריה, כולל החזרים", async () => {
  const repo = fakeRepo({
    "2026-11": [
      { category: "coffee", amount: 40 },
      { category: "coffee", amount: 25 },
      { category: "tea", amount: 15 },
      { category: "coffee", amount: -10 },
    ],
    "2026-10": [{ category: "tea", amount: 999 }],
  });
  assert.deepEqual(await monthlyReport(repo, 2026, 11), { count: 4, total: 70, byCategory: { coffee: 55, tea: 15 } });
});

test("חודש בלי מכירות", async () => {
  assert.deepEqual(await monthlyReport(fakeRepo({}), 2026, 1), { count: 0, total: 0, byCategory: {} });
});
