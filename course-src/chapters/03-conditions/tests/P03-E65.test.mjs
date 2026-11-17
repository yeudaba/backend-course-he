import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E65.js";
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

test("סטודנט בן 24", () => ok(["זכאי להנחה? true", "מחיר: 40 ₪"]));
test("סטודנט בן 31", () => ok(["זכאי להנחה? false", "מחיר: 50 ₪"], [/(age\s*=\s*)24\b/, "$131", "את const age = 24;"]));
test("חייל בן 24", () => ok(["זכאי להנחה? true", "מחיר: 40 ₪"], [/(isStudent\s*=\s*)true\b/, "$1false", "את const isStudent = true;"], [/(isSoldier\s*=\s*)false\b/, "$1true", "את const isSoldier = false;"]));
test("לא סטודנט ולא חייל", () => ok(["זכאי להנחה? false", "מחיר: 50 ₪"], [/(isStudent\s*=\s*)true\b/, "$1false", "את const isStudent = true;"]));
test("ביטוי אחד ב־isEligible", () => assert.match(bare(), /const\s+isEligible\s*=[^;\n]*\|\|[^;\n]*&&|const\s+isEligible\s*=[^;\n]*&&[^;\n]*\|\|/, "כתוב את הזכאות כביטוי אחד עם || ו־&& במשתנה const isEligible"));
