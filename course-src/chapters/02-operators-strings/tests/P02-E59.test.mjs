import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E59.js";
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

const withInput = (v) => [/(input\s*=\s*)"12abc"/, `$1"${v}"`, 'את const input = "12abc";'];
test("הפלט זהה לפלט הרצוי", () => ok(["קלט: 12abc", "מספר: NaN", "NaN? true"]));
test('קלט "42"', () => ok(["קלט: 42", "מספר: 42", "NaN? false"], withInput("42")));
test('קלט "3.5"', () => ok(["קלט: 3.5", "מספר: 3.5", "NaN? false"], withInput("3.5")));
test("בודקים עם Number.isNaN", () => assert.match(bare(), /Number\.isNaN\(/, "השתמש ב־Number.isNaN"));
