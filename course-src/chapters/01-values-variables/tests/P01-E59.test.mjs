import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E59.js";

test("הפלט נשאר זהה", () => {
  sameOutput(run(import.meta.url, FILE), ["החנות שלי | מבקרים: 2"]);
});

test("אין var; const למה שלא משתנה, let למה שמשתנה", () => {
  const c = code(source(import.meta.url, FILE));
  assert.ok(!/\bvar\b/.test(c), "עדיין יש var בקוד");
  assert.match(c, /const\s+siteName\b/, "siteName לא מקבל ערך חדש — const");
  assert.match(c, /let\s+visitors\b/, "visitors מתעדכן — let");
});
