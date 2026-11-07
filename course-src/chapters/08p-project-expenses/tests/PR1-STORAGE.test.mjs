import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const s = await load(import.meta.url, "expenses-cli/src/storage.js");
const tmp = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pr1-")), "expenses.json");

test("קובץ לא קיים → מערך ריק", () => assert.deepEqual(s.loadExpenses(tmp()), []));
test("שמירה וטעינה", () => {
  const file = tmp();
  const data = [{ id: 1, date: "2026-10-01", category: "food", amount: 5, note: "" }];
  s.saveExpenses(file, data);
  assert.deepEqual(s.loadExpenses(file), data);
  assert.ok(fs.readFileSync(file, "utf8").includes('\n  {'), "JSON מעוצב עם הזחה");
});
test("קובץ פגום", () => {
  const file = tmp();
  fs.writeFileSync(file, "{not json");
  assert.throws(() => s.loadExpenses(file), { code: "CORRUPT_FILE" });
  fs.writeFileSync(file, '{"a":1}');
  assert.throws(() => s.loadExpenses(file), { code: "CORRUPT_FILE" });
});
