import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { run } = await load(import.meta.url, "expenses-cli/src/cli.js");
function setup() {
  const filePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pr1cli-")), "expenses.json");
  const out = [];
  const exec = (...argv) => run(argv, { filePath, log: (msg) => out.push(String(msg)) });
  return { filePath, out, exec };
}

test("add ואז list", () => {
  const { out, exec } = setup();
  assert.equal(exec("add", "2026-10-01", "food", "54.5", "lunch", "with", "team"), 0);
  assert.equal(out.at(-1), "נוספה הוצאה #1");
  exec("add", "2026-10-03", "Transport", "12");
  assert.equal(exec("list"), 0);
  assert.equal(out.at(-1), "#1   2026-10-01  food             54.50  lunch with team\n#2   2026-10-03  transport        12.00");
});
test("list עם מסננים", () => {
  const { out, exec } = setup();
  exec("add", "2026-10-01", "food", "10");
  exec("add", "2026-11-01", "food", "20");
  exec("list", "--month", "2026-11");
  assert.equal(out.at(-1), "#2   2026-11-01  food             20.00");
  assert.equal(exec("list", "--color", "red"), 1);
  assert.match(out.at(-1), /^שגיאה: /);
});
test("summary ו־delete", () => {
  const { out, exec } = setup();
  exec("add", "2026-10-01", "food", "10");
  exec("add", "2026-10-02", "fun", "30");
  exec("summary", "2026-10");
  assert.equal(out.at(-1), "סיכום 2026-10: 2 הוצאות, סה״כ 40.00\n  fun              30.00\n  food             10.00");
  assert.equal(exec("delete", "1"), 0);
  assert.equal(out.at(-1), "הוצאה #1 נמחקה");
  assert.equal(exec("delete", "1"), 1);
  assert.equal(out.at(-1), "שגיאה: לא נמצאה הוצאה עם מזהה 1");
});
test("שגיאות לא מקריסות", () => {
  const { out, exec, filePath } = setup();
  assert.equal(exec("add", "2026-02-30", "food", "5"), 1);
  assert.equal(out.at(-1), "שגיאה: תאריך לא תקין: 2026-02-30 (פורמט: YYYY-MM-DD)");
  assert.equal(exec("add", "2026-02-01"), 1);
  assert.equal(fs.existsSync(filePath), false, "לא נשמר קובץ אחרי שגיאה");
  assert.equal(exec("oops"), 1);
  assert.ok(out.at(-1).startsWith("פקודה לא מוכרת: oops"));
  assert.equal(exec("help"), 0);
  assert.ok(out.at(-1).startsWith("שימוש:"));
});
