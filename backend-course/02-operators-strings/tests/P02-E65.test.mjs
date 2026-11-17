import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E65.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["ממוצע: 4.4", "כוכבים: 4", "★★★★"]));
test('סכום "250"', () => ok(["ממוצע: 2.6", "כוכבים: 3", "★★★"], [/(ratingsSumInput\s*=\s*)" 431 "/, '$1"250"', 'את const ratingsSumInput = " 431 ";']));
test("שורת הכוכבים נבנית בקוד", () => {
  assert.ok(!strings(source(import.meta.url, FILE)).some((s) => s.includes("★★")), "כתבת כמה כוכבים בתוך מירכאות — בנה את השורה עם padStart");
});
