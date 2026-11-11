import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E64.js";
// הקוד שלך בלי הערות ובלי טקסט במירכאות (מה שבתוך ${...} נשאר)
const bare = () => code(source(import.meta.url, FILE)).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '""').replace(/`(?:\\.|[^`\\])*`/g, (t) => (t.match(/\$\{[^}]*\}/g) ?? []).join(" "));
// מריץ את הקובץ (אפשר עם ערכים מוחלפים) ומשווה לפלט הרצוי
const ok = (lines, ...changes) => sameOutput(run(import.meta.url, FILE, { changes }), lines);
// המספרים האלה צריכים להיות מחושבים — לא כתובים בקוד
const notWritten = (...nums) => {
  for (const n of nums) {
    const re = new RegExp(`(?<![\\d.])${String(n).replace(".", "\\.")}(?![\\d.])`);
    assert.ok(!re.test(bare()), `המספר ${n} כתוב בקוד שלך — הוא צריך להיות מחושב`);
  }
};

test("הפלט זהה לפלט הרצוי", () => ok(["במלאי: 40", "הוזמנו: 55", "יישאר במלאי: 0", "חסרים: 15"]));
test('הוזמנו "25"', () => ok(["במלאי: 40", "הוזמנו: 25", "יישאר במלאי: 15", "חסרים: 0"], [/(orderedInput\s*=\s*)"55"/, '$1"25"', 'את const orderedInput = "55";']));
test("ממירים, ובלי לרדת מתחת ל־0", () => {
  assert.match(bare(), /Number\(/, "המר את הקלטים עם Number");
  assert.match(bare(), /Math\.max\(/, "כדי לא לרדת מתחת ל־0 — Math.max");
});
