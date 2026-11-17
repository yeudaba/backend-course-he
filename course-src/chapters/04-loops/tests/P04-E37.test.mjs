import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E37.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["אחרי 14 הכפלות (4:40 שעות): 1638400 חיידקים"]));
test("יעד 1000", () => ok(["אחרי 4 הכפלות (1:20 שעות): 1600 חיידקים"], [/(target\s*=\s*)1000000\b/, "$11000", "את const target = 1000000;"]));
test("התחלה מ־3, יעד 100", () => ok(["אחרי 6 הכפלות (2:00 שעות): 192 חיידקים"], [/(start\s*=\s*)100\b/, "$13", "את const start = 100;"], [/(target\s*=\s*)1000000\b/, "$1100", "את const target = 1000000;"]));
test("עם while", () => assert.match(bare(), /\bwhile\s*\(/, "התרגיל מתרגל while — לא ידוע מראש כמה הכפלות"));
