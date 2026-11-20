import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E41.js";
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט זהה לפלט הרצוי", () => {
  const r = run(import.meta.url, FILE);
  const typeLine = r.lines.find((l) => l.startsWith("סוג הסכום:")) ?? "";
  if (/number\d/.test(typeLine))
    assert.fail(`בשורה האחרונה יצא "${typeLine}". typeof חל רק על הערך שמיד אחריו — כאן רק על 12 — ואחר כך + מדביק את שאר המספרים לטקסט "number". איך אומרים ל־JavaScript לחשב קודם את כל החיבור, ורק אז לשאול על הסוג?`);
  sameOutput(r, ["קפה הפינה — קבלה", "אספרסו כפול: 12", "קרואסון: 14", "מים: 8", "---", "סה״כ לתשלום: 34", "סוג הסכום: number"]);
});

test("המחירים הם מספרים, והסה״כ מחושב באותה שורה", () => {
  const src = source(import.meta.url, FILE);
  const bad = strings(src).filter((s) => /\d|number/.test(s));
  assert.deepEqual(bad, [], "יש מחרוזות עם מספר או עם number — המחירים הם ערכים, ואת הסוג מחשבים עם typeof");
  assert.ok(!/(^|[^\d.])34(?![\d.])/.test(bare(src)), "34 כתוב בקוד — Node צריך לחשב אותו מ־12 + 14 + 8");
});

test("הסה״כ והסוג מודפסים באותה שורה עם הכותרת שלהם (פסיק בתוך log)", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /console\.log\(\s*["']סה״כ לתשלום:["']\s*,/, 'לא מצאנו console.log("סה״כ לתשלום:", ...) — הכותרת והחשבון באותה קריאה, מופרדים בפסיק');
});
