import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E40.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["ממוצע: 84.33333333333333", "מעוגל: 84", "הגבוה: 90", "הנמוך: 78", "טווח: 12"]));
test("כש־grade1 הוא 100", () => ok(["ממוצע: 91.66666666666667", "מעוגל: 92", "הגבוה: 100", "הנמוך: 85", "טווח: 15"], [/(grade1\s*=\s*)78\b/, "$1100", "את const grade1 = 78;"]));
test("משתמשים ב־Math.max וב־Math.min", () => {
  assert.match(bare(), /Math\.max\(/, "את הגבוה מוצאים עם Math.max");
  assert.match(bare(), /Math\.min\(/, "את הנמוך מוצאים עם Math.min");
});
