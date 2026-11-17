import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E58.js";
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

const withQty = (q) => [/(quantityInput\s*=\s*)" 3 "/, `$1"${q}"`, 'את const quantityInput = " 3 ";'];
test('" 3 "', () => ok(["הוזמנו 3. נשארו 7 במלאי"]));
test('"abc"', () => ok(["שגיאה: הכמות חייבת להיות מספר"], withQty("abc")));
test('"15"', () => ok(["יש רק 10 במלאי"], withQty("15")));
test('"10"', () => ok(["הוזמנו 10. נשארו 0 במלאי"], withQty("10")));
