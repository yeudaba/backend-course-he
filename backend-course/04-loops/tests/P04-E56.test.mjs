import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E56.js";
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

test("47 פריטים, 10 בעמוד", () => ok(["עמוד 1: פריטים 1–10", "עמוד 2: פריטים 11–20", "עמוד 3: פריטים 21–30", "עמוד 4: פריטים 31–40", "עמוד 5: פריטים 41–47"]));
test("30 פריטים", () => ok(["עמוד 1: פריטים 1–10", "עמוד 2: פריטים 11–20", "עמוד 3: פריטים 21–30"], [/(totalItems\s*=\s*)47\b/, "$130", "את const totalItems = 47;"]));
test("20 בעמוד", () => ok(["עמוד 1: פריטים 1–20", "עמוד 2: פריטים 21–40", "עמוד 3: פריטים 41–47"], [/(pageSize\s*=\s*)10\b/, "$120", "את const pageSize = 10;"]));
test("3 פריטים", () => ok(["עמוד 1: פריטים 1–3"], [/(totalItems\s*=\s*)47\b/, "$13", "את const totalItems = 47;"]));
