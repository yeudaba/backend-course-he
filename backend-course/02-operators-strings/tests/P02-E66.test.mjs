import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E66.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["פריט 1: 49.90", "פריט 2: 3 x 15 = 45.00", "סה״כ: 94.90", "באגורות: 9490"]));
test('מחיר ראשון "10"', () => ok(["פריט 1: 10.00", "פריט 2: 3 x 15 = 45.00", "סה״כ: 55.00", "באגורות: 5500"], [/(price1\s*=\s*)"49\.90"/, '$1"10"', 'את const price1 = "49.90";']));
test("סכום מצטבר", () => {
  assert.match(bare(), /let\s+total\s*=\s*0/, "התחל עם let total = 0;");
  assert.ok((bare().match(/total\s*\+=/g) ?? []).length >= 2, "הוסף כל פריט ל־total עם +=");
  assert.match(bare(), /Math\.round\(/, "באגורות — Math.round");
});
