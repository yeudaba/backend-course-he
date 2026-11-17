import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E60.js";
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

const withInput = (v) => [/(celsiusInput\s*=\s*)"36\.6"/, `$1"${v}"`, 'את const celsiusInput = "36.6";'];
test("הפלט זהה לפלט הרצוי", () => ok(["36.6°C = 97.9°F", "סוג התוצאה: string"]));
test("100 מעלות", () => ok(["100°C = 212.0°F", "סוג התוצאה: string"], withInput("100")));
test("‎-40 מעלות", () => ok(["-40°C = -40.0°F", "סוג התוצאה: string"], withInput("-40")));
test("ממירים במפורש, מעגלים עם toFixed", () => {
  assert.match(bare(), /Number\(/, "המר את הקלט עם Number");
  assert.match(bare(), /toFixed\(\s*1\s*\)/, "עגל עם toFixed(1)");
});
