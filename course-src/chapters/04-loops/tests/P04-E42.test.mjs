import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E42.js";
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

const withN = (v) => [/(n\s*=\s*)13\b/, `$1${v}`, "את const n = 13;"];
test("13", () => ok(["13 בבינארי: 1101"]));
test("8", () => ok(["8 בבינארי: 1000"], withN(8)));
test("0", () => ok(["0 בבינארי: 0"], withN(0)));
test("255", () => ok(["255 בבינארי: 11111111"], withN(255)));
test("בלי כלים מוכנים", () => assert.doesNotMatch(bare(), /toString\s*\(/, "כתוב את ההמרה בעצמך, עם לולאה — בלי toString"));
