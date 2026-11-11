import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E77.js";
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

const withSize = (n) => [/(size\s*=\s*)4\b/, `$1${n}`, "את const size = 4;"];
test("4×4", () => ok(["#.#.", ".#.#", "#.#.", ".#.#"]));
test("3×3", () => ok(["#.#", ".#.", "#.#"], withSize(3)));
test("1×1", () => ok(["#"], withSize(1)));
test("לולאה מקוננת", () => assert.ok((bare().match(/\bfor\s*\(/g) ?? []).length >= 2, "צריך שתי לולאות for — אחת בתוך השנייה"));
