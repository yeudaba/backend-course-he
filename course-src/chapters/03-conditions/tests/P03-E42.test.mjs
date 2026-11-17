import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E42.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["סוג המזהה מה־URL: string", "בלי המרה: false", "עם המרה: true"]));
test('מזהה "43"', () => ok(["סוג המזהה מה־URL: string", "בלי המרה: false", "עם המרה: false"], [/(idFromUrl\s*=\s*)"42"/, '$1"43"', 'את const idFromUrl = "42";']));
test("רק === (בלי ==)", () => {
  assert.doesNotMatch(bare(), /[^=!]==[^=]/, "מצאנו == — השתמש ב־===");
  assert.ok(!strings(source(import.meta.url, FILE)).some((s) => /string|true|false/.test(s)), "כתבת את התשובה בתוך מירכאות — חשב אותה");
});
