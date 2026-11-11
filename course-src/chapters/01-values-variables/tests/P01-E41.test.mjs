import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E41.js";
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["קפה הפינה — קבלה", "אספרסו כפול: 12", "קרואסון: 14", "מים: 8", "---", "סה״כ לתשלום: 34", "סוג הסכום: number"]);
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
