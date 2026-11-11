import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E23-validate.js";

const cases = [
  ["", "שגיאה: חובה להזין גיל"],
  ["   ", "שגיאה: חובה להזין גיל"],
  ["abc", "שגיאה: גיל חייב להיות מספר"],
  ["-5", "שגיאה: גיל לא הגיוני"],
  ["200", "שגיאה: גיל לא הגיוני"],
  ["10", "קבוצה: קטין"],
  ["30", "קבוצה: מבוגר"],
  ["70", "קבוצה: גמלאי"],
];

for (const [input, expected] of cases) {
  test(`ageInput = "${input}" ← ${expected}`, () => {
    const r = run(import.meta.url, FILE, { changes: [[/ageInput = "[^"]*"/, `ageInput = "${input}"`, "את השורה const ageInput = ..."]] });
    sameOutput(r, [expected]);
  });
}
