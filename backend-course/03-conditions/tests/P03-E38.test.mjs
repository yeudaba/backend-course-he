import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E38.js";
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

const withBudget = (n) => [/(budget\s*=\s*)500\b/, `$1${n}`, "את const budget = 500;"];
test("הפלט זהה לפלט הרצוי", () => ok(["סה״כ: 477.90", "בתוך התקציב? true", "נשאר: 22.10", "חורג? false"]));
test("תקציב 400", () => ok(["סה״כ: 477.90", "בתוך התקציב? false", "נשאר: -77.90", "חורג? true"], withBudget(400)));
test("תקציב 477.9 בדיוק", () => ok(["סה״כ: 477.90", "בתוך התקציב? true", "נשאר: 0.00", "חורג? false"], withBudget(477.9)));
