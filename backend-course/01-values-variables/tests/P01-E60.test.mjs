import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E60.js";
const expected = (id) => [
  `לפני: id ${id} | name נועה | email null | lastLogin undefined`,
  `אחרי: id ${id} | name נועה | email noa@example.com | lastLogin 2026-11-11`,
];

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), expected(7));
});

test("const למה שקבוע, let למה שמשתנה, ו־null/undefined הם ערכים", () => {
  const src = source(import.meta.url, FILE);
  const c = code(src);
  assert.match(c, /const\s+id\b/, "id לא משתנה — const");
  assert.match(c, /const\s+name\b/, "name לא משתנה — const");
  assert.match(c, /let\s+email\s*=\s*null\b/, "בהתחלה אין מייל, בכוונה — let email = null;");
  assert.match(c, /let\s+lastLogin\s*;/, "המשתמש עוד לא התחבר אף פעם — let lastLogin; (בלי ערך)");
  assert.ok(!/=\s*undefined\b/.test(c), "אל תציב undefined בעצמך — JavaScript שמה אותו");
  assert.deepEqual(strings(src).filter((s) => /null|undefined/.test(s)), [], "כתבת null או undefined בתוך מירכאות — הדפס את המשתנה עצמו");
});

test("עם id 12 — שתי השורות משתנות", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [[/(id\s*=\s*)7\b/, "$112", "את const id = 7"]] }), expected(12));
});
