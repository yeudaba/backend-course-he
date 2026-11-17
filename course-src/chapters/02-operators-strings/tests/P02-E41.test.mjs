import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E41.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["יתרה התחלתית: 1000", "אחרי הפקדה: 1250", "אחרי משיכה: 850", "אחרי עמלה: 835", "אחרי משיכה גדולה: 0"]));
test("יתרה התחלתית 2000", () => ok(["יתרה התחלתית: 2000", "אחרי הפקדה: 2250", "אחרי משיכה: 1850", "אחרי עמלה: 1835", "אחרי משיכה גדולה: 835"], [/(balance\s*=\s*)1000\b/, "$12000", "את let balance = 1000;"]));
test("קיצורים ו־Math.max", () => {
  assert.match(bare(), /\+=/, "את ההפקדה עושים עם +=");
  assert.match(bare(), /-=/, "משיכה ועמלה — עם -=");
  assert.match(bare(), /Math\.max\(/, "כדי לא לרדת מתחת ל־0 — Math.max");
});
