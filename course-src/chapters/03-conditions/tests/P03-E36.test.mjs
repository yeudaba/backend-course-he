import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E36.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["כטקסט: 10 > 9? false", "כמספרים: 10 > 9? true", "שווים? false"]));
test("2 מול 15", () => ok(["כטקסט: 2 > 15? true", "כמספרים: 2 > 15? false", "שווים? false"], [/(firstInput\s*=\s*)"10"/, '$1"2"', 'את const firstInput = "10";'], [/(secondInput\s*=\s*)"9"/, '$1"15"', 'את const secondInput = "9";']));
test("7 מול 7.0", () => ok(["כטקסט: 7 > 7.0? false", "כמספרים: 7 > 7? false", "שווים? true"], [/(firstInput\s*=\s*)"10"/, '$1"7"', 'את const firstInput = "10";'], [/(secondInput\s*=\s*)"9"/, '$1"7.0"', 'את const secondInput = "9";']));
