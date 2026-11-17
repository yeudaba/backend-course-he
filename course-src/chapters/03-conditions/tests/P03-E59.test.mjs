import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E59.js";
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

const withKm = (v) => [/(distanceKm\s*=\s*)130\b/, `$1${v}`, "את const distanceKm = 130;"];
test("130 ק״מ", () => ok(["זמן נסיעה: 1:27 שעות"]));
test("30 ק״מ", () => ok(["זמן נסיעה: 20 דקות"], withKm(30)));
test("250 ק״מ", () => ok(["זמן נסיעה: 2:47 שעות", "מומלץ לעצור להפסקה"], withKm(250)));
test("93 ק״מ (דקות עם אפס מוביל)", () => ok(["זמן נסיעה: 1:02 שעות"], withKm(93)));
test("180 ק״מ (בדיוק שעתיים)", () => ok(["זמן נסיעה: 2:00 שעות"], withKm(180)));
