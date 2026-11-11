import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E52.js";
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

const withNumber = (n) => [/(orderNumber\s*=\s*)42\b/, `$1${n}`, "את let orderNumber = 42;"];
test("הפלט זהה לפלט הרצוי", () => ok(["הזמנה נוכחית: ORD-00042", "הזמנה הבאה: ORD-00043", "סוג המזהה: string", "אורך המזהה: 9"]));
test("הזמנה 7", () => ok(["הזמנה נוכחית: ORD-00007", "הזמנה הבאה: ORD-00008", "סוג המזהה: string", "אורך המזהה: 9"], withNumber(7)));
test("הזמנה 12345", () => ok(["הזמנה נוכחית: ORD-12345", "הזמנה הבאה: ORD-12346", "סוג המזהה: string", "אורך המזהה: 9"], withNumber(12345)));
test("++ ו־padStart", () => {
  assert.match(bare(), /orderNumber\s*\+\+/, "את ההזמנה הבאה מחשבים עם orderNumber++");
  assert.match(bare(), /padStart\(/, "את האפסים מוסיפים עם padStart");
  assert.ok(!strings(source(import.meta.url, FILE)).some((s) => /string/.test(s)), "המילה string כתובה במירכאות — השתמש ב־typeof");
});
