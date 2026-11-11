import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E34.js";
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

const withAge = (n) => [/(age\s*=\s*)17\b/, `$1${n}`, "את const age = 17;"];
test("גיל 17", () => ok(["גיל 17 — בגיר? false", "גיל 17 — זכאי לפנסיה? false"]));
test("גיל 18", () => ok(["גיל 18 — בגיר? true", "גיל 18 — זכאי לפנסיה? false"], withAge(18)));
test("גיל 70", () => ok(["גיל 70 — בגיר? true", "גיל 70 — זכאי לפנסיה? true"], withAge(70)));
test("גיל 67 בדיוק", () => ok(["גיל 67 — בגיר? true", "גיל 67 — זכאי לפנסיה? true"], withAge(67)));
