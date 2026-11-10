import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E27.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["טמפרטורה: undefined", "טמפרטורה: 24", "טמפרטורה: null"]);
});

test("משתנה אחד בלבד: let temperature בלי ערך התחלתי", () => {
  const src = code(source(import.meta.url, FILE));
  const decl = src.match(/\b(let|const|var)\s+temperature\b[^;\n]*/g) ?? [];
  assert.equal(decl.length, 1, "צריך הגדרה אחת בדיוק של temperature");
  assert.match(decl[0], /^let\s+temperature\s*$/, "הגדר let temperature; — בלי = (את undefined JavaScript שמה לבד)");
});

test("undefined, ‏24 ו־null מגיעים מהמשתנה ולא מטקסט", () => {
  const src = source(import.meta.url, FILE);
  assert.ok(!strings(src).some((s) => /undefined|null|24/.test(s)), "יש מחרוזת שמכילה undefined, null או 24 — הדפס את המשתנה עצמו");
  assert.match(code(src), /temperature\s*=\s*null\b/, "בסוף צריך להציב null במשתנה (החיישן נותק)");
});
