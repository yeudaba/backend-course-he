import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E44.js";
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

const withEmail = (e) => [/(emailInput\s*=\s*)"[^"]*"/, `$1"${e}"`, "את const emailInput = ..."];
test("הפלט זהה לפלט הרצוי", () => ok(["נקי: dana@mail.com", "יש @? true", "@ לא בהתחלה? true", "נגמר ב־.com או .co.il? true"]));
test('"@mail.com"', () => ok(["נקי: @mail.com", "יש @? true", "@ לא בהתחלה? false", "נגמר ב־.com או .co.il? true"], withEmail("@mail.com")));
test('" Yossi@Walla.CO.IL"', () => ok(["נקי: yossi@walla.co.il", "יש @? true", "@ לא בהתחלה? true", "נגמר ב־.com או .co.il? true"], withEmail(" Yossi@Walla.CO.IL")));
test('"dana.mail.org"', () => ok(["נקי: dana.mail.org", "יש @? false", "@ לא בהתחלה? false", "נגמר ב־.com או .co.il? false"], withEmail("dana.mail.org")));
