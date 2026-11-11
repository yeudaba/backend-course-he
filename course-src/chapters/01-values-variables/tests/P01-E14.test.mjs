import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E14.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["הפקדה 200 | יתרה: 700", "משיכה 350 | יתרה: 350", "הפקדה 50 | יתרה: 400", "יתרה סופית: 400"]);
});

test("סכומי הפעולות שמורים ב־const, והיתרה ב־let", () => {
  const src = code(source(import.meta.url, FILE));
  const consts = src.match(/\bconst\s+\w+\s*=\s*\d+/g) ?? [];
  assert.ok(consts.length >= 3, `מצאנו ${consts.length} משתני const עם מספר — צריך אחד לכל סכום פעולה (שלושה)`);
  assert.match(src, /\blet\s+\w+\s*=\s*500\b/, "היתרה משתנה — let balance = 500;");
});

test("היתרה מחושבת (מתחילים מ־1000 ← יתרה סופית 900)", () => {
  const r = run(import.meta.url, FILE, { changes: [[/=\s*500\b/, "= 1000", "את היתרה ההתחלתית (= 500)"]] });
  sameOutput(r, ["הפקדה 200 | יתרה: 1200", "משיכה 350 | יתרה: 850", "הפקדה 50 | יתרה: 900", "יתרה סופית: 900"]);
});
