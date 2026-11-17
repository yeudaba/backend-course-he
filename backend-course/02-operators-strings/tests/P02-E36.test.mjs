import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E36.js";
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

const withPassengers = (n) => [/(passengers\s*=\s*)130\b/, `$1${n}`, "את const passengers = 130;"];
test("130 נוסעים", () => ok(["אוטובוסים צריך: 3", "אוטובוסים מלאים: 2", "נשארו אחרי המלאים: 30", "מקומות פנויים: 20"]));
test("150 נוסעים", () => ok(["אוטובוסים צריך: 3", "אוטובוסים מלאים: 3", "נשארו אחרי המלאים: 0", "מקומות פנויים: 0"], withPassengers(150)));
test("7 נוסעים", () => ok(["אוטובוסים צריך: 1", "אוטובוסים מלאים: 0", "נשארו אחרי המלאים: 7", "מקומות פנויים: 43"], withPassengers(7)));
test("אוטובוסים של 40", () => ok(["אוטובוסים צריך: 4", "אוטובוסים מלאים: 3", "נשארו אחרי המלאים: 10", "מקומות פנויים: 30"], [/(busSize\s*=\s*)50\b/, "$140", "את const busSize = 50;"]));
