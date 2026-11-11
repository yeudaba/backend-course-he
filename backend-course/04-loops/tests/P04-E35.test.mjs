import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E35.js";
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

const withLimit = (n) => [/(limit\s*=\s*)100\b/, `$1${n}`, "את const limit = 100;"];
test("עד 100", () => ok(["1", "2", "4", "8", "16", "32", "64"]));
test("עד 10", () => ok(["1", "2", "4", "8"], withLimit(10)));
test("עד 1024 (כולל)", () => ok(["1", "2", "4", "8", "16", "32", "64", "128", "256", "512", "1024"], withLimit(1024)));
test("עם while", () => assert.match(bare(), /\bwhile\s*\(/, "התרגיל מתרגל while"));
