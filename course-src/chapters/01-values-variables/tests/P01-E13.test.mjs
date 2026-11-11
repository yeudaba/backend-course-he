import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E13.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["אספרסו כפול: 12", "קרואסון: 14", "מים: 8", "---", "סה״כ: 34"]);
});

test("כל מחיר כתוב בקוד פעם אחת בלבד, והסה״כ לא כתוב בכלל", () => {
  const src = code(source(import.meta.url, FILE));
  for (const n of ["12", "14", "8"]) {
    const count = src.match(new RegExp(`\\b${n}\\b`, "g"))?.length ?? 0;
    assert.equal(count, 1, `המחיר ${n} מופיע בקוד ${count} פעמים — צריך פעם אחת`);
  }
  assert.ok(!/\b34\b/.test(src), "המספר 34 כתוב בקוד — הסה״כ צריך להיות מחושב");
});

test("שינוי מחיר הקרואסון ל־16 במקום אחד משנה גם את הסה״כ", () => {
  const r = run(import.meta.url, FILE, { changes: [[/=\s*14\b/, "= 16", "את מחיר הקרואסון (= 14)"]] });
  sameOutput(r, ["אספרסו כפול: 12", "קרואסון: 16", "מים: 8", "---", "סה״כ: 36"]);
});
