import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E57.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["שליח: null", "שליח: אבי", "שליח: null"]);
});

test("משתנה אחד courier, שמתחיל ב־null ומסתיים ב־null", () => {
  const src = source(import.meta.url, FILE);
  const c = code(src);
  assert.equal(c.match(/\blet\s+courier\b/g)?.length ?? 0, 1, "צריך בדיוק הגדרה אחת: let courier = ...");
  assert.match(c, /let\s+courier\s*=\s*null\b/, "בהתחלה אין שליח בכוונה — let courier = null;");
  assert.equal(c.match(/courier\s*=\s*null\b/g)?.length ?? 0, 2, "courier צריך לקבל null פעמיים: בהתחלה, ואחרי שהמשלוח נמסר");
  const bad = strings(src).filter((s) => /null/.test(s));
  assert.deepEqual(bad, [], 'כתבת "null" בתוך מירכאות — זה טקסט, לא הערך null');
});

test('עם השליח "מאיה" — השורה השנייה משתנה', () => {
  const r = run(import.meta.url, FILE, { changes: [[/(courier\s*=\s*)["']אבי["']/, '$1"מאיה"', 'את courier = "אבי"']] });
  sameOutput(r, ["שליח: null", "שליח: מאיה", "שליח: null"]);
});
