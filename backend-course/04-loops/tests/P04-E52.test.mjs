import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E52.js";
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

const range = (a, b) => [[/(from\s*=\s*)3\b/, `$1${a}`, "את const from = 3;"], [/(to\s*=\s*)11\b/, `$1${b}`, "את const to = 11;"]];
test("3 עד 11", () => ok(["סכום האי־זוגיים בין 3 ל־11: 35 (5 מספרים)"]));
test("4 עד 10", () => ok(["סכום האי־זוגיים בין 4 ל־10: 21 (3 מספרים)"], ...range(4, 10)));
test("1 עד 1", () => ok(["סכום האי־זוגיים בין 1 ל־1: 1 (1 מספרים)"], ...range(1, 1)));
test("8 עד 8", () => ok(["סכום האי־זוגיים בין 8 ל־8: 0 (0 מספרים)"], ...range(8, 8)));
test("עם for", () => assert.match(bare(), /\bfor\s*\(/, "התרגיל מתרגל for"));
