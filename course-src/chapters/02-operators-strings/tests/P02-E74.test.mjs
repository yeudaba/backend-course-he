import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E74.js";
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

const withWeight = (w) => [/(weightInput\s*=\s*)"2\.5"/, `$1"${w}"`, 'את const weightInput = "2.5";'];
test("הפלט זהה לפלט הרצוי", () => ok(["משקל: 2.5 ק״ג", "תוספת משקל: 20", "לתשלום: 40.00 ₪"]));
test('משקל "4"', () => ok(["משקל: 4 ק״ג", "תוספת משקל: 32", "לתשלום: 52.00 ₪"], withWeight("4")));
test('משקל "0.3"', () => ok(["משקל: 0.3 ק״ג", "תוספת משקל: 2.4", "לתשלום: 22.40 ₪"], withWeight("0.3")));
