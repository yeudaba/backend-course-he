import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseLine, parseExpenses } = await load(import.meta.url, "P08-E17.js");

test("parseLine", () => {
  assert.deepEqual(parseLine("2026-10-01, אוכל, 54.5"), { date: "2026-10-01", category: "אוכל", amount: 54.5 });
  assert.throws(() => parseLine("2026-10-02, תחבורה"), { message: "חסרים שדות" });
  assert.throws(() => parseLine("2026-10-03, קפה, abc"), { message: "סכום לא תקין" });
  assert.throws(() => parseLine("2026-10-03, קפה, -5"), { message: "סכום לא תקין" });
});
test("parseExpenses ממשיך אחרי שגיאות", () => {
  const input = "2026-10-01, אוכל, 54.5\n2026-10-02, תחבורה\n\n2026-10-03, קפה, abc\n2026-10-04, ספרים, 89";
  assert.deepEqual(parseExpenses(input), {
    expenses: [{ date: "2026-10-01", category: "אוכל", amount: 54.5 }, { date: "2026-10-04", category: "ספרים", amount: 89 }],
    errors: [{ line: 2, message: "חסרים שדות" }, { line: 4, message: "סכום לא תקין" }],
  });
});
test("ריק", () => assert.deepEqual(parseExpenses(""), { expenses: [], errors: [] }));
