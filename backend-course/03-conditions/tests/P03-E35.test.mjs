import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E35.js";
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

const withRole = (r) => [/(typedRole\s*=\s*)"[^"]*"/, `$1"${r}"`, "את const typedRole = ..."];
test("הפלט זהה לפלט הרצוי", () => ok(["השוואה ישירה: false", "אחרי ניקוי: true"]));
test('הקלידו "admin"', () => ok(["השוואה ישירה: true", "אחרי ניקוי: true"], withRole("admin")));
test('הקלידו " editor"', () => ok(["השוואה ישירה: false", "אחרי ניקוי: false"], withRole(" editor")));
