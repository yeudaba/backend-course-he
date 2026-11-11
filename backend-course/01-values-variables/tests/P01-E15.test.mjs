import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, strings } from "./_out.mjs";

const FILE = "P01-E15.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["לפני: קפה תה", "אחרי: תה קפה"]);
});

test("המילים \"קפה\" ו\"תה\" כתובות בקוד פעם אחת בלבד", () => {
  const s = strings(source(import.meta.url, FILE));
  assert.equal(s.filter((x) => x === "קפה").length, 1, "\"קפה\" צריך להופיע רק בהגדרה של first");
  assert.equal(s.filter((x) => x === "תה").length, 1, "\"תה\" צריך להופיע רק בהגדרה של second");
});

test("ההחלפה עובדת גם עם ערכים אחרים", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(["'`])קפה\1/, '"מיץ"', 'את "קפה"'],
      [/(["'`])תה\1/, '"סודה"', 'את "תה"'],
    ],
  });
  sameOutput(r, ["לפני: מיץ סודה", "אחרי: סודה מיץ"]);
});
