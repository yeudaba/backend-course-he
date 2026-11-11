import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E22-wrong-output.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מוצר: אוזניות", "מחיר: 199", "במלאי: true"]);
});

test("מדפיסים ערכים של משתנים — גם כשהערכים משתנים", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      ["199", "249", "את המחיר 199"],
      ["true", "false", "את הערך true"],
    ],
  });
  sameOutput(r, ["מוצר: אוזניות", "מחיר: 249", "במלאי: false"]);
});

test("נשאר משתנה אחד לשם המוצר", () => {
  assert.doesNotMatch(code(source(import.meta.url, FILE)), /\bproductname\b/, "עדיין יש משתנה בשם productname — שני שמות כמעט זהים הם מתכון לבאג. מחק את המיותר");
});
