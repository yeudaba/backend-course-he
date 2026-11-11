import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E57.js";
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

test("3 פריטים", () => ok(["יש לך 3 פריטים בעגלה (149.70 ₪)"]));
test("פריט אחד", () => ok(["יש לך פריט אחד בעגלה (49.90 ₪)"], [/(items\s*=\s*)3\b/, "$11", "את const items = 3;"], [/(total\s*=\s*)149\.7\b/, "$149.9", "את const total = 149.7;"]));
test("עגלה ריקה", () => ok(["העגלה ריקה"], [/(items\s*=\s*)3\b/, "$10", "את const items = 3;"], [/(total\s*=\s*)149\.7\b/, "$10", "את const total = 149.7;"]));
