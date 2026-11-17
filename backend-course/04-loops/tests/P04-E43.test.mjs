import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E43.js";
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

const withMoney = (v) => [/(moneyInput\s*=\s*)"20"/, `$1"${v}"`, 'את const moneyInput = "20";'];
test('"20"', () => ok(["נקנו 3 כוסות, נשאר 0.50 ₪"]));
test('"abc"', () => ok(["שגיאה: סכום לא תקין"], withMoney("abc")));
test("ריק", () => ok(["שגיאה: סכום לא תקין"], withMoney("")));
test('"5"', () => ok(["נקנו 0 כוסות, נשאר 5.00 ₪"], withMoney("5")));
test('"7"', () => ok(["נקנו 1 כוס, נשאר 0.50 ₪"], withMoney("7")));
test('"13"', () => ok(["נקנו 2 כוסות, נשאר 0.00 ₪"], withMoney("13")));
