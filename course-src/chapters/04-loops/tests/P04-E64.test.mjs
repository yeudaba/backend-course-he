import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E64.js";
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

const withR = (r) => [/(readings\s*=\s*)"3719462"/, `$1"${r}"`, 'את const readings = "3719462";'];
test("3719462", () => ok(["מקסימום: 9 (בדקה 3)", "מינימום: 1", "סכום: 32"]));
test("5555", () => ok(["מקסימום: 5 (בדקה 0)", "מינימום: 5", "סכום: 20"], withR("5555")));
test("0123", () => ok(["מקסימום: 3 (בדקה 3)", "מינימום: 0", "סכום: 6"], withR("0123")));
test("98", () => ok(["מקסימום: 9 (בדקה 0)", "מינימום: 8", "סכום: 17"], withR("98")));
test("בלי Math.max", () => assert.doesNotMatch(bare(), /Math\.(max|min)\(/, "התרגיל מתרגל את דפוס המקסימום — מצא אותו עם לולאה ו־if"));
