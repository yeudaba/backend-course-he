import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E68.js";
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

const withName = (n) => [/(username\s*=\s*)"dana_99"/, `$1"${n}"`, 'את const username = "dana_99";'];
test("dana_99", () => ok(["שם משתמש תקין"]));
test("dana!x", () => ok(['תו לא חוקי "!" במקום 4'], withName("dana!x")));
test("Dana", () => ok(['תו לא חוקי "D" במקום 0'], withName("Dana")));
test("dan a", () => ok(['תו לא חוקי " " במקום 3'], withName("dan a")));
test("x", () => ok(["שם משתמש תקין"], withName("x")));
test("עוצרים עם break", () => assert.match(bare(), /\bbreak\b/, "עצור את הלולאה ברגע שנמצא תו לא חוקי — break"));
