import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E20-const.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["פתחנו את קפה הפינה", "מבקרים היום: 3"]);
});

test("שינוי אחד בלבד: visitors הוא let, ושם החנות נשאר const", () => {
  const c = code(source(import.meta.url, FILE));
  assert.match(c, /let\s+visitors\b/, "visitors משתנה — לכן הוא צריך להיות מוגדר עם let");
  assert.match(c, /const\s+shopName\b/, "shopName לא משתנה — השאר אותו const (משנים רק את מה שצריך)");
});
