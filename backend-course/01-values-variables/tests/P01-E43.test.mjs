import { test } from "node:test";
import assert from "node:assert/strict";
import { run, source, code } from "./_out.mjs";

const FILE = "P01-E43.js";

test("השורה הראשונה מודפסת, ואז התוכנית נעצרת עם ReferenceError על False", () => {
  const r = run(import.meta.url, FILE);
  assert.notEqual(r.status, 0, "הקובץ רץ עד הסוף בלי שגיאה — חסרה השורה עם False");
  assert.match(r.stderr, /ReferenceError: False is not defined/, "ציפינו לשגיאה ReferenceError: False is not defined");
  assert.deepEqual(r.lines, ["לפני השגיאה: number"], "לפני השגיאה צריכה להיות מודפסת בדיוק השורה: לפני השגיאה: number");
});

test('השורה "אחרי השגיאה" כתובה בקוד (אחרי השורה השבורה) — ולא הודפסה', () => {
  const src = code(source(import.meta.url, FILE));
  const after = src.search(/console\.log\(\s*["']אחרי השגיאה["']\s*\)/);
  assert.ok(after >= 0, 'לא מצאנו console.log("אחרי השגיאה") בקוד');
  assert.ok(src.indexOf("False") >= 0 && src.indexOf("False") < after, "השורה עם False צריכה להיות לפני השורה של \"אחרי השגיאה\"");
  assert.match(src, /typeof/, "את number בשורה הראשונה מחשבים עם typeof");
});
