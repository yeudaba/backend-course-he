import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, strings } from "./_out.mjs";

const FILE = "P01-E25.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["לפני: אדום ירוק כחול", "אחרי: ירוק כחול אדום"]);
});

test("כל צבע כתוב בקוד פעם אחת בלבד", () => {
  const s = strings(source(import.meta.url, FILE));
  for (const color of ["אדום", "ירוק", "כחול"]) {
    assert.equal(s.filter((x) => x === color).length, 1, `"${color}" צריך להופיע רק בהגדרה שלו`);
  }
});

test("הסיבוב עובד גם עם ערכים אחרים", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(["'`])אדום\1/, '"1"', 'את "אדום"'],
      [/(["'`])ירוק\1/, '"2"', 'את "ירוק"'],
      [/(["'`])כחול\1/, '"3"', 'את "כחול"'],
    ],
  });
  sameOutput(r, ["לפני: 1 2 3", "אחרי: 2 3 1"]);
});
