import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E41.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["שבוע 1: 900.00", "שבוע 2: 810.00", "שבוע 3: 729.00", "שבוע 4: 656.10", "שבוע 5: 590.49", "שבוע 6: 531.44", "שבוע 7: 478.30", "ירד מתחת ל־500 אחרי 7 שבועות"]));
test("יעד 800", () => ok(["שבוע 1: 900.00", "שבוע 2: 810.00", "שבוע 3: 729.00", "ירד מתחת ל־800 אחרי 3 שבועות"], [/(targetPrice\s*=\s*)500\b/, "$1800", "את const targetPrice = 500;"]));
