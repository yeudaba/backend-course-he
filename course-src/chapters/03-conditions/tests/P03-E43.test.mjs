import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E43.js";
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

const withSize = (n) => [/(fileSizeBytes\s*=\s*)3500000\b/, `$1${n}`, "את const fileSizeBytes = 3500000;"];
test("הפלט זהה לפלט הרצוי", () => ok(["גודל: 3.34 MB", "מותר: עד 2 MB", "גדול מדי? true"]));
test("1500000 בתים", () => ok(["גודל: 1.43 MB", "מותר: עד 2 MB", "גדול מדי? false"], withSize(1500000)));
test("2 MB בדיוק", () => ok(["גודל: 2.00 MB", "מותר: עד 2 MB", "גדול מדי? false"], withSize(2097152)));
test("2 MB ובית אחד", () => ok(["גודל: 2.00 MB", "מותר: עד 2 MB", "גדול מדי? true"], withSize(2097153)));
