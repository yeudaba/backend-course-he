import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E70.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["משלוח היום? true", "דמי משלוח: 31.00 ₪"]));
test("סכום 350", () => ok(["משלוח היום? true", "דמי משלוח: 0.00 ₪"], [/(total\s*=\s*)120\b/, "$1350", "את const total = 120;"]));
test("הזמנה בשעה 15", () => ok(["משלוח היום? false", "דמי משלוח: 31.00 ₪"], [/(orderHour\s*=\s*)11\b/, "$115", "את const orderHour = 11;"]));
test("חבר מועדון, 5 ק״מ", () => ok(["משלוח היום? true", "דמי משלוח: 0.00 ₪"], [/(isClubMember\s*=\s*)false\b/, "$1true", "את const isClubMember = false;"], [/(distanceKm\s*=\s*)18\b/, "$15", "את const distanceKm = 18;"]));
test("5 ק״מ, לא חבר", () => ok(["משלוח היום? true", "דמי משלוח: 15.00 ₪"], [/(distanceKm\s*=\s*)18\b/, "$15", "את const distanceKm = 18;"]));
test("40 ק״מ בשבת", () => ok(["משלוח היום? false", "דמי משלוח: 75.00 ₪"], [/(distanceKm\s*=\s*)18\b/, "$140", "את const distanceKm = 18;"], [/(isWeekday\s*=\s*)true\b/, "$1false", "את const isWeekday = true;"]));
