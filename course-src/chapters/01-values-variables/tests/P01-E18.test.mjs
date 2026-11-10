import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E18.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מוצר: כיסא משרדי", "מלאי בתחילת היום: 40", "נמכרו: 34", "הוחזרו: 2", "מלאי בסוף היום: 8"]);
});

test("המספרים 34 ו־8 לא כתובים בקוד — הם מחושבים", () => {
  const src = code(source(import.meta.url, FILE));
  assert.ok(!/\b34\b/.test(src), "המספר 34 כתוב בקוד");
  assert.ok(!/\b8\b/.test(src), "המספר 8 כתוב בקוד");
});

test("מלאי התחלתי אחר (100) ← מלאי סופי 68", () => {
  const r = run(import.meta.url, FILE, { changes: [[/=\s*40\b/, "= 100", "את המלאי ההתחלתי (= 40)"]] });
  sameOutput(r, ["מוצר: כיסא משרדי", "מלאי בתחילת היום: 100", "נמכרו: 34", "הוחזרו: 2", "מלאי בסוף היום: 68"]);
});
