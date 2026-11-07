// P22-E17 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidIsraeliId } from "./P22-E17.ts";

// "טבלה" של מקרים — ובדיקה אחת שעוברת עליה. מקרה חדש = שורה חדשה
const cases: [string, boolean, string][] = [
  ["123456782", true, "תקין"],
  ["039337423", true, "תקין, מתחיל ב־0"],
  ["000000018", true, "צריך \"מעל 9 ← מחסירים 9\"? לא, אבל משקל 2"],
  ["18", true, "קצר — משלימים אפסים"],
  ["999999998", true, "הרבה ספרות מעל 9 אחרי הכפלה"],
  [" 123456782 ", true, "רווחים מסביב"],
  ["123456789", false, "ספרת ביקורת שגויה"],
  ["300000004", false, "שגוי"],
  ["1234567820", false, "10 ספרות"],
  ["12345678a", false, "לא ספרה"],
  ["1234 0004", false, "רווח באמצע (123400004 תקין) — Number(\" \") הוא 0, אז בלי בדיקת ספרות זה היה \"עובר\""],
  ["", false, "ריק"],
];

for (const [id, expected, why] of cases) {
  test(`${JSON.stringify(id)} ← ${expected} (${why})`, () => {
    assert.equal(isValidIsraeliId(id), expected);
  });
}
