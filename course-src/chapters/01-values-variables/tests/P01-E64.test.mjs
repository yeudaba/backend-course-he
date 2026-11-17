import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E64.js";
const expected = (pages, borrower) => [
  `ספר: הנסיך הקטן | עמודים: ${pages} | סוג: number`,
  "זמין: true | שואל: null | תאריך החזרה: undefined",
  "--- הספר הושאל ---",
  `זמין: false | שואל: ${borrower} | תאריך החזרה: 2026-12-01`,
];

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), expected(96, "דני"));
});

test("כל משתנה הוגדר נכון", () => {
  const src = source(import.meta.url, FILE);
  const c = code(src);
  assert.ok(!/\bvar\b/.test(c), "יש var בקוד — בקורס הזה משתמשים רק ב־const ו־let");
  assert.match(c, /const\s+title\b/, "title לא משתנה — const");
  assert.match(c, /const\s+pages\b/, "pages לא משתנה — const");
  assert.match(c, /let\s+isAvailable\s*=\s*true\b/, "isAvailable מתחיל ב־true ומשתנה — let isAvailable = true;");
  assert.match(c, /let\s+borrower\s*=\s*null\b/, "בהתחלה אין שואל, בכוונה — let borrower = null;");
  assert.match(c, /let\s+dueDate\s*;/, "תאריך ההחזרה עוד לא נקבע — let dueDate; (בלי ערך)");
  const bad = strings(src).filter((s) => /\b(true|false|null|undefined|number)\b/.test(s));
  assert.deepEqual(bad, [], "יש מחרוזת עם true / false / null / undefined / number — הדפס את המשתנים ואת typeof, לא טקסט");
});

test('עם 120 עמודים ושואלת בשם "מיכל" — הכרטיס מתעדכן', () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(pages\s*=\s*)96\b/, "$1120", "את const pages = 96"],
      [/(borrower\s*=\s*)["']דני["']/, '$1"מיכל"', 'את borrower = "דני"'],
    ],
  });
  sameOutput(r, expected(120, "מיכל"));
});
