import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E77.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["1 תגובה", "סטטוס: לא מחובר"]));
test("5 תגובות, מחובר", () => ok(["5 תגובות", "סטטוס: מחובר"], [/(count\s*=\s*)1\b/, "$15", "את const count = 1;"], [/(isOnline\s*=\s*)false\b/, "$1true", "את const isOnline = false;"]));
test("ternary ולא if", () => {
  assert.doesNotMatch(bare(), /\bif\s*\(/, "התרגיל הוא על ternary — בלי if");
  assert.ok((bare().match(/\?/g) ?? []).length >= 2, "צריך שני ternary — אחד בכל שורה");
});
