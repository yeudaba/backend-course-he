import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E42.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["חנות: ספרים ועוד", "מחיר: 59.9", "במבצע: true", "סוג המחיר: number"]);
});

test("שלושת התיקונים נעשו נכון", () => {
  const src = code(source(import.meta.url, FILE));
  assert.ok(!/\bTrue\b/.test(src), "True עדיין בקוד — בוליאני כותבים באותיות קטנות");
  assert.ok(!/59\s*,\s*90/.test(src), "59,90 עדיין בקוד — פסיק מפריד בין שני ערכים; עשרוני כותבים עם נקודה");
  assert.match(src, /,\s*59\.90?\s*\)/, "המחיר צריך להיות מספר אחד: 59.9 (או 59.90)");
});
