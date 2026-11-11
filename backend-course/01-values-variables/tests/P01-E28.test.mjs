import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E28.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), [
    "מטבע | חיים: 3 | נקודות: 10",
    "פגיעה | חיים: 2 | נקודות: 10",
    "מטבע | חיים: 2 | נקודות: 20",
    "יהלום | חיים: 2 | נקודות: 70",
    "סיום: 2 חיים, 70 נקודות",
  ]);
});

test("התוצאות לא כתובות בקוד — רק שלושת הקבועים", () => {
  const src = code(source(import.meta.url, FILE));
  for (const n of ["20", "70"]) assert.ok(!new RegExp(`\\b${n}\\b`).test(src), `המספר ${n} כתוב בקוד — הוא צריך להיות מחושב`);
});

test("עם ערכים אחרים (5 חיים, מטבע 7, יהלום 100) החישוב נכון", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(startLives\s*=\s*)3\b/, "$15", "את const startLives = 3"],
      [/(coinPoints\s*=\s*)10\b/, "$17", "את const coinPoints = 10"],
      [/(diamondPoints\s*=\s*)50\b/, "$1100", "את const diamondPoints = 50"],
    ],
  });
  sameOutput(r, [
    "מטבע | חיים: 5 | נקודות: 7",
    "פגיעה | חיים: 4 | נקודות: 7",
    "מטבע | חיים: 4 | נקודות: 14",
    "יהלום | חיים: 4 | נקודות: 114",
    "סיום: 4 חיים, 114 נקודות",
  ]);
});
