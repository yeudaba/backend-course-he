import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E81.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["סה״כ: 80", "עם טיפ: 88", "עוגיות שנשארו מחוץ לקופסאות: 2", "שטח השולחן: 9"]);
});

test("ערכים אחרים: 5 אנשים, 23 עוגיות, צלע 4", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/people\s*=\s*4/, "people = 5", "את השורה const people = 4"],
      [/cookies\s*=\s*20/, "cookies = 23", "את השורה const cookies = 20"],
      [/side\s*=\s*3/, "side = 4", "את השורה const side = 3"],
    ],
  });
  sameOutput(r, ["סה״כ: 100", "עם טיפ: 110", "עוגיות שנשארו מחוץ לקופסאות: 5", "שטח השולחן: 16"]);
});

test("עוד ערכים: קפה 10, קופסה של 7", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/coffee\s*=\s*12/, "coffee = 10", "את השורה const coffee = 12"],
      [/perBox\s*=\s*6/, "perBox = 7", "את השורה const perBox = 6"],
    ],
  });
  sameOutput(r, ["סה״כ: 72", "עם טיפ: 79.2", "עוגיות שנשארו מחוץ לקופסאות: 6", "שטח השולחן: 9"]);
});
