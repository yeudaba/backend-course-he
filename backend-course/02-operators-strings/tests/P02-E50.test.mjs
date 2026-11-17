import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E50.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["3 x חולצה = 240 ש״ח", "הנחה (10%): 24 ש״ח", "לתשלום: 216 ש״ח"]));
test("כמות 2", () => ok(["2 x חולצה = 160 ש״ח", "הנחה (10%): 16 ש״ח", "לתשלום: 144 ש״ח"], [/(quantity\s*=\s*)3\b/, "$12", "את const quantity = 3;"]));
test("הנחה של 25%", () => ok(["3 x חולצה = 240 ש״ח", "הנחה (25%): 60 ש״ח", "לתשלום: 180 ש״ח"], [/(discountPercent\s*=\s*)10\b/, "$125", "את const discountPercent = 10;"]));
test("בונים טקסט עם template literals", () => {
  assert.match(code(source(import.meta.url, FILE)), /`/, "לא מצאנו גרשיים הפוכים — בנה את השורות עם template literal");
});
