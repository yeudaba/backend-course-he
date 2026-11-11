import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E11.js";

test("4 כרטיסים × 62.5", () => {
  sameOutput(run(import.meta.url, FILE), ["4 כרטיסים × 62.5 = 250", "סוג התוצאה: number"]);
});

test("קלט אחר: 3 כרטיסים × 40", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(ticketsInput\s*=\s*)(["'`])4\2/, '$1"3"', 'את const ticketsInput = "4"'],
      [/(ticketPriceInput\s*=\s*)(["'`])62\.5\2/, '$1"40"', 'את const ticketPriceInput = "62.5"'],
    ],
  });
  sameOutput(r, ["3 כרטיסים × 40 = 120", "סוג התוצאה: number"]);
});

test("הקלט מומר במפורש למספר", () => {
  assert.match(code(source(import.meta.url, FILE)), /Number\(|parseFloat\(|parseInt\(/, "השתמש ב־Number(...) לפני החישוב");
});
