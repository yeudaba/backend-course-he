import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E36.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["אחרי 6 חודשים: 5100 ₪"]));
test("1000 בחודש", () => ok(["אחרי 4 חודשים: 5200 ₪"], [/(monthly\s*=\s*)650\b/, "$11000", "את const monthly = 650;"]));
test("כבר יש 5000", () => ok(["אחרי 0 חודשים: 5000 ₪"], [/(startBalance\s*=\s*)1200\b/, "$15000", "את const startBalance = 1200;"]));
test("עם while", () => assert.match(bare(), /\bwhile\s*\(/, "התרגיל מתרגל while"));
