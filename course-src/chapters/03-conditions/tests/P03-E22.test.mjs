import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E22-zero.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["דמי משלוח: 0", "הנחת מועדון: 0%", "מלאי: אזל"]);
});

test("ערכים שאינם 0 נשארים כמו שהם", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/savedShippingFee = 0/, "savedShippingFee = 40", "את השורה savedShippingFee = 0"],
      [/savedClubDiscount = 0/, "savedClubDiscount = 10", "את השורה savedClubDiscount = 0"],
      [/stock = 0/, "stock = 7", "את השורה stock = 7"],
    ],
  });
  sameOutput(r, ["דמי משלוח: 40", "הנחת מועדון: 10%", "מלאי: 7"]);
});

test("הגדרה שלא נשמרה (undefined) ← ברירת המחדל", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/savedShippingFee = 0/, "savedShippingFee = undefined", "את השורה savedShippingFee = 0"],
      [/savedClubDiscount = 0/, "savedClubDiscount = undefined", "את השורה savedClubDiscount = 0"],
    ],
  });
  sameOutput(r, ["דמי משלוח: 25", "הנחת מועדון: 5%", "מלאי: אזל"]);
});

test("מלאי שלא נטען (undefined) — עדיין מודפסת שורת מלאי", () => {
  const r = run(import.meta.url, FILE, { changes: [[/stock = 0/, "stock = undefined", "את השורה stock = 0"]] });
  printedLines(r);
});

function printedLines(r) {
  sameOutput({ ...r, lines: r.lines.slice(0, 2) }, ["דמי משלוח: 0", "הנחת מועדון: 0%"]);
  assert.equal(r.lines.length, 3, "כש־stock הוא undefined הקוד לא מדפיס שום שורת מלאי — הוסף מקרה (else) שמטפל בזה");
  assert.match(r.lines[2], /^מלאי:/, "השורה השלישית צריכה להתחיל ב־\"מלאי:\"");
  assert.ok(!/אזל/.test(r.lines[2]), "מלאי שלא נטען הוא לא \"אזל\" — הדפס שהוא לא ידוע");
}
