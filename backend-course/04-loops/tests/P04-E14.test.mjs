import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P04-E14.js";

test("הטבלה מהתרגיל", () => {
  sameOutput(run(import.meta.url, FILE), ["שנה  הפקדות  יתרה", "1    1000    1040.00", "2    2000    2121.60", "3    3000    3246.46", "4    4000    4416.32", "5    5000    5632.98"]);
});

test("הפקדה של 2000 במשך 3 שנים", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(yearlyDeposit\s*=\s*)1000\b/, "$12000", "את const yearlyDeposit = 1000"],
      [/(years\s*=\s*)5\b/, "$13", "את const years = 5"],
    ],
  });
  sameOutput(r, ["שנה  הפקדות  יתרה", "1    2000    2080.00", "2    4000    4243.20", "3    6000    6492.93"]);
});
