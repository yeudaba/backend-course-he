import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E33.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["a === b: false", "a !== b: true", "a > b: false", "a < b: true", "a >= b: false", "a <= b: true"]));
test("כש־a הוא 20", () => ok(["a === b: true", "a !== b: false", "a > b: false", "a < b: false", "a >= b: true", "a <= b: true"], [/(a\s*=\s*)12\b/, "$120", "את const a = 12;"]));
test("כש־a הוא 30", () => ok(["a === b: false", "a !== b: true", "a > b: true", "a < b: false", "a >= b: true", "a <= b: false"], [/(a\s*=\s*)12\b/, "$130", "את const a = 12;"]));
