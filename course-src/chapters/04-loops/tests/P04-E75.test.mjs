import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E75.js";
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

const withLetter = (l) => [/(letter\s*=\s*)"s"/, `$1"${l}"`, 'את const letter = "s";'];
test("s", () => ok(["s מופיעה 4 פעמים"]));
test("p", () => ok(["p מופיעה 2 פעמים"], withLetter("p")));
test("z", () => ok(["z מופיעה 0 פעמים"], withLetter("z")));
test("עם for...of", () => assert.match(bare(), /for\s*\(\s*(const|let)\s+\w+\s+of\b/, "התרגיל מתרגל for...of"));
