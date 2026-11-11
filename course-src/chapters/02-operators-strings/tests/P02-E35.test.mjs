import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E35.js";
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

test("הפלט זהה לפלט הרצוי", () => ok(["אחרי פריט 1: 45", "אחרי פריט 2: 75", "אחרי פריט 3: 100", "אחרי קופון: 80", "הזמנה כפולה: 160"]));
test("פריט ראשון ב־50", () => ok(["אחרי פריט 1: 50", "אחרי פריט 2: 80", "אחרי פריט 3: 105", "אחרי קופון: 85", "הזמנה כפולה: 170"], [/(cart\s*\+=\s*)45\b/, "$150", "את cart += 45"]));
test("רק קיצורים", () => {
  const src = bare();
  assert.ok((src.match(/\+=/g) ?? []).length >= 3, "צריך שלוש פעמים +=");
  assert.match(src, /-=/, "את הקופון מורידים עם -=");
  assert.match(src, /\*=/, "את ההכפלה עושים עם *=");
  assert.doesNotMatch(src, /cart\s*=\s*cart/, "כתבת cart = cart ... — השתמש בקיצור");
});
