import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E34.js";
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

test("הפלט עם מחיר 200", () => ok(["מחיר: 200", "מע״מ: 36", "סה״כ: 236"]));
test("עם מחיר 50", () => ok(["מחיר: 50", "מע״מ: 9", "סה״כ: 59"], [/(price\s*=\s*)200\b/, "$150", "את const price = 200;"]));
test("עם מחיר 1000", () => ok(["מחיר: 1000", "מע״מ: 180", "סה״כ: 1180"], [/(price\s*=\s*)200\b/, "$11000", "את const price = 200;"]));
test("המע״מ והסה״כ מחושבים", () => notWritten(36, 236));
