import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P03-E78.js";
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

const withName = (n) => [/(fileName\s*=\s*)"Report\.PDF"/, `$1"${n}"`, 'את const fileName = "Report.PDF";'];
test("Report.PDF", () => ok(["Report.PDF: מסמך PDF"]));
test("photo.JPEG", () => ok(["photo.JPEG: תמונה"], withName("photo.JPEG")));
test("logo.png", () => ok(["logo.png: תמונה"], withName("logo.png")));
test("clip.mp4", () => ok(["clip.mp4: וידאו"], withName("clip.mp4")));
test("setup.exe", () => ok(["setup.exe: סוג לא מוכר"], withName("setup.exe")));
test("משתמשים ב־switch", () => assert.match(bare(), /\bswitch\s*\(/, "התרגיל הוא על switch"));
