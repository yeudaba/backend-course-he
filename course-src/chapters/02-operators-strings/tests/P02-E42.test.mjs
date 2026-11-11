import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E42.js";
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

const withMinutes = (n) => [/(minutesParked\s*=\s*)135\b/, `$1${n}`, "את const minutesParked = 135;"];
test("135 דקות", () => ok(["זמן חניה: 135 דקות", "שעות לחיוב: 3", "לתשלום: 36", "סוג הסכום: number"]));
test("60 דקות", () => ok(["זמן חניה: 60 דקות", "שעות לחיוב: 1", "לתשלום: 12", "סוג הסכום: number"], withMinutes(60)));
test("61 דקות", () => ok(["זמן חניה: 61 דקות", "שעות לחיוב: 2", "לתשלום: 24", "סוג הסכום: number"], withMinutes(61)));
test("שם הסוג מחושב עם typeof", () => {
  assert.ok(!strings(source(import.meta.url, FILE)).some((s) => /number/.test(s)), "המילה number כתובה במירכאות — השתמש ב־typeof");
});
