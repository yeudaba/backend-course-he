import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E51.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["הודעה: [נפגשים מחר ב־8 בבוקר ליד הכניסה]", "אורך: 31", "נשארו: 39", "תצוגה מקדימה: נפגשים מחר..."]));
test("הודעה אחרת ומגבלה של 160", () => ok(["הודעה: [Your code is 4417]", "אורך: 17", "נשארו: 143", "תצוגה מקדימה: Your code ..."], [/(message\s*=\s*)"[^"]*"/, '$1" Your code is 4417   "', "את const message = ..."], [/(maxLength\s*=\s*)70\b/, "$1160", "את const maxLength = 70;"]));
test("הודעה קצרה", () => ok(["הודעה: [שלום]", "אורך: 4", "נשארו: 66", "תצוגה מקדימה: שלום..."], [/(message\s*=\s*)"[^"]*"/, '$1"  שלום  "', "את const message = ..."]));
