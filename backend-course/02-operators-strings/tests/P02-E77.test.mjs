import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E77.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["DAN26-007", "אורך: 9"]));
test("שם אחר", () => ok(["YOS26-007", "אורך: 9"], [/(name\s*=\s*)" dana "/, '$1" yossi "', 'את const name = " dana ";']));
test("שנה ומספר אחרים", () => ok(["DAN31-042", "אורך: 9"], [/(year\s*=\s*)2026\b/, "$12031", "את const year = 2026;"], [/(serial\s*=\s*)7\b/, "$142", "את const serial = 7;"]));
test("שומרים במשתנה coupon", () => assert.match(bare(), /const\s+coupon\s*=/, "שמור את הקופון ב־const coupon = ..."));
