import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E70.js";
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

const withYear = (y) => [/(fromYear\s*=\s*)2025\b/, `$1${y}`, "את const fromYear = 2025;"];
test("2025", () => ok(["השנה המעוברת הבאה אחרי 2025: 2028", "בין 2000 ל־2100 יש 25 שנים מעוברות"]));
test("2096", () => ok(["השנה המעוברת הבאה אחרי 2096: 2104", "בין 2000 ל־2100 יש 25 שנים מעוברות"], withYear(2096)));
test("2028 (בעצמה מעוברת)", () => ok(["השנה המעוברת הבאה אחרי 2028: 2032", "בין 2000 ל־2100 יש 25 שנים מעוברות"], withYear(2028)));
test("1899", () => ok(["השנה המעוברת הבאה אחרי 1899: 1904", "בין 2000 ל־2100 יש 25 שנים מעוברות"], withYear(1899)));
