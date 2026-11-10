import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E28.js";

test("החשבון מהתרגיל", () => {
  sameOutput(run(import.meta.url, FILE), ["צריכה: 262 קוט״ש", "לפני מע״מ: 167.73 ₪", "כולל מע״מ (18%): 197.92 ₪"]);
});

test("קריאת מונה אחרת (11000)", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(currentReading\s*=\s*)(["'`]).*?\2/, '$1" 11000 "', "את const currentReading = ..."]] });
  sameOutput(r, ["צריכה: 550 קוט״ש", "לפני מע״מ: 352.11 ₪", "כולל מע״מ (18%): 415.49 ₪"]);
});

test("מע״מ של 17% — גם האחוז בשורה השלישית מתעדכן", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(vatPercent\s*=\s*)18\b/, "$117", "את const vatPercent = 18"]] });
  sameOutput(r, ["צריכה: 262 קוט״ש", "לפני מע״מ: 167.73 ₪", "כולל מע״מ (17%): 196.25 ₪"]);
});

test("הקריאות מומרות למספר (ולא מחוברות כטקסט)", () => {
  assert.match(code(source(import.meta.url, FILE)), /Number\(|parseFloat\(|parseInt\(/, "המר את הקריאות עם Number(...)");
});
