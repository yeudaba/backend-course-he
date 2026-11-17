import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E57.js";
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

test("כל 25 דקות", () => ok(["06:00", "06:25", "06:50", "07:15", "07:40"]));
test("כל 30 דקות", () => ok(["06:00", "06:30", "07:00", "07:30", "08:00"], [/(intervalMinutes\s*=\s*)25\b/, "$130", "את const intervalMinutes = 25;"]));
test("עד 7", () => ok(["06:00", "06:25", "06:50"], [/(endHour\s*=\s*)8\b/, "$17", "את const endHour = 8;"]));
test("מ־9 עד 11, כל 45", () => ok(["09:00", "09:45", "10:30"], [/(startHour\s*=\s*)6\b/, "$19", "את const startHour = 6;"], [/(endHour\s*=\s*)8\b/, "$111", "את const endHour = 8;"], [/(intervalMinutes\s*=\s*)25\b/, "$145", "את const intervalMinutes = 25;"]));
