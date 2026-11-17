import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E37.js";
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

const withPassword = (p) => [/(password\s*=\s*)"abc12345"/, `$1"${p}"`, 'את const password = "abc12345";'];
test("הפלט זהה לפלט הרצוי", () => ok(["אורך: 8", "ארוכה מספיק (8+)? true", "שונה מ־password? true", "מכילה @? false", "מתחילה ב־abc? true"]));
test('סיסמה "PassWord"', () => ok(["אורך: 8", "ארוכה מספיק (8+)? true", "שונה מ־password? false", "מכילה @? false", "מתחילה ב־abc? false"], withPassword("PassWord")));
test('סיסמה "x@1"', () => ok(["אורך: 3", "ארוכה מספיק (8+)? false", "שונה מ־password? true", "מכילה @? true", "מתחילה ב־abc? false"], withPassword("x@1")));
