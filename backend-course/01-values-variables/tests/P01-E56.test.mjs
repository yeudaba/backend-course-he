import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E56.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["email: tal@example.com | string", "phone: null | object", "birthday: undefined | undefined"]);
});

test("phone הוא null בכוונה, ו־birthday מוגדר בלי ערך", () => {
  const src = source(import.meta.url, FILE);
  const c = code(src);
  assert.match(c, /phone\s*=\s*null\b/, "phone צריך לקבל את הערך null (בלי מירכאות)");
  assert.match(c, /let\s+birthday\s*;/, "birthday עוד לא מולא — הגדר אותו בלי ערך: let birthday;");
  const bad = strings(src).filter((s) => /null|undefined|object|string/.test(s));
  assert.deepEqual(bad, [], "יש מחרוזת עם null / undefined / object / string — הדפס את המשתנה ואת typeof שלו, לא טקסט");
});

test("עם כתובת מייל אחרת — השורה הראשונה משתנה", () => {
  const r = run(import.meta.url, FILE, { changes: [[/["']tal@example\.com["']/, '"dan@example.com"', 'את "tal@example.com"']] });
  sameOutput(r, ["email: dan@example.com | string", "phone: null | object", "birthday: undefined | undefined"]);
});
