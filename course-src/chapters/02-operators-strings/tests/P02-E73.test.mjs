import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E73.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["9", "45", "20", "54", "-1"]));
test("כש־a הוא 3", () => ok(["8", "35", "15", "53", "-2"], [/(a\s*=\s*)4\b/, "$13", "את const a = 4;"]));
test("בלי ספרות בשורות שלך", () => {
  const rest = bare().replace(/const\s+a\s*=\s*4\s*;?/, "").replace(/const\s+b\s*=\s*""\s*;?/, "");
  assert.doesNotMatch(rest, /\d/, "יש ספרה בקוד שלך — בנה כל תוצאה רק מ־a ומ־b");
});
