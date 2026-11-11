import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E69.js";
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

const withNick = (v) => [/(nicknameInput\s*=\s*)null\b/, `$1${v}`, "את const nicknameInput = null;"];
test("בלי כינוי (null)", () => ok(["שלום, Dana!"]));
test('כינוי "  Dee "', () => ok(["שלום, Dee!"], withNick('"  Dee "')));
test("כינוי ריק", () => ok(["שלום, Dana!"], withNick('""')));
test("כינוי של רווחים", () => ok(["שלום, Dana!"], withNick('"   "')));
test("שם פרטי אחר", () => ok(["שלום, Yossi!"], [/(firstName\s*=\s*)" dana "/, '$1"yossi  "', 'את const firstName = " dana ";']));
