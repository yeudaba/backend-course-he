import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E52.js";
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

const withCity = (c) => [/(cityInput\s*=\s*)"[^"]*"/, `$1"${c}"`, "את const cityInput = ..."];
test("tel aviv", () => ok(["משלוח ל־tel aviv: 0 ₪"]));
test("HAIFA", () => ok(["משלוח ל־haifa: 25 ₪"], withCity("HAIFA")));
test("Eilat", () => ok(["משלוח ל־eilat: 35 ₪"], withCity("Eilat ")));
test("Jerusalem", () => ok(["משלוח ל־jerusalem: 20 ₪"], withCity("  Jerusalem")));
test("שורת הדפסה אחת", () => {
  const n = (bare().match(/console\.log\(/g) ?? []).length;
  assert.equal(n, 1, `מצאנו ${n} שורות console.log — הצב ל־shipping בתוך התנאים, והדפס פעם אחת בסוף`);
});
