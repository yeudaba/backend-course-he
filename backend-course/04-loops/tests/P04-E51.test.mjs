import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E51.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["1 × 12.5 = 12.50", "2 × 12.5 = 25.00", "3 × 12.5 = 37.50", "4 × 12.5 = 50.00", "5 × 12.5 = 62.50"]));
test("מחיר 10, עד 3", () => ok(["1 × 10 = 10.00", "2 × 10 = 20.00", "3 × 10 = 30.00"], [/(unitPrice\s*=\s*)12\.5\b/, "$110", "את const unitPrice = 12.5;"], [/(maxQty\s*=\s*)5\b/, "$13", "את const maxQty = 5;"]));
