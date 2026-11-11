import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P04-E76.js";
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

const withEmail = (e) => [/(email\s*=\s*)"dana@mail\.com"/, `$1"${e}"`, 'את const email = "dana@mail.com";'];
test("dana@mail.com", () => ok(["d***@mail.com"]));
test("yossi.c@x.io", () => ok(["y******@x.io"], withEmail("yossi.c@x.io")));
test("a@b.co", () => ok(["a@b.co"], withEmail("a@b.co")));
test("עם לולאה", () => assert.match(bare(), /\bfor\s*\(/, "בנה את המחרוזת בלולאה"));
