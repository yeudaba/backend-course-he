import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E69.js";
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

test("7 ק״מ ביום", () => ok(["נסיעה של 7 ק״מ (יום): 64.00 ₪"]));
test("7 ק״מ בלילה", () => ok(["נסיעה של 7 ק״מ (לילה): 80.00 ₪"], [/(isNight\s*=\s*)false\b/, "$1true", "את const isNight = false;"]));
test("ק״מ אחד", () => ok(["נסיעה של 1 ק״מ (יום): 12.00 ₪"], [/(distanceKm\s*=\s*)7\b/, "$11", "את const distanceKm = 7;"]));
test("3 ק״מ בלילה", () => ok(["נסיעה של 3 ק״מ (לילה): 40.00 ₪"], [/(distanceKm\s*=\s*)7\b/, "$13", "את const distanceKm = 7;"], [/(isNight\s*=\s*)false\b/, "$1true", "את const isNight = false;"]));
test("עם לולאה", () => assert.match(bare(), /\b(for|while)\s*\(/, "חשב את המחיר בלולאה, ק״מ אחרי ק״מ"));
