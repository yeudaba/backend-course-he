import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E53.js";
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

const withSpent = (v) => [/(totalSpent\s*=\s*)1250\b/, `$1${v}`, "את const totalSpent = 1250;"];
test("1250", () => ok(["דרגה: כסף", "עוד 750 ₪ לדרגה הבאה"]));
test("5000", () => ok(["דרגה: פלטינה", "זו הדרגה הגבוהה ביותר"], withSpent(5000)));
test("100", () => ok(["דרגה: רגיל", "עוד 400 ₪ לדרגה הבאה"], withSpent(100)));
test("1999", () => ok(["דרגה: כסף", "עוד 1 ₪ לדרגה הבאה"], withSpent(1999)));
test("2000", () => ok(["דרגה: זהב", "עוד 3000 ₪ לדרגה הבאה"], withSpent(2000)));
