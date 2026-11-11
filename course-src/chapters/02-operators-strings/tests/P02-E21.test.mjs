import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E21-string-bugs.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["משתמש: DANA", "אורך השם: 4", "אימייל: dana@mail.com", "דומיין חוקי? true"]);
});

test("עובד גם עם שם ואימייל אחרים", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      ['" dana "', '"  moshe "', 'את השם " dana "'],
      ['"  Dana@Mail.com  "', '" Avi@Shop.COM   "', 'את האימייל "  Dana@Mail.com  "'],
    ],
  });
  sameOutput(r, ["משתמש: MOSHE", "אורך השם: 5", "אימייל: avi@shop.com", "דומיין חוקי? true"]);
});

test("בדיקת הדומיין נשארה endsWith", () => {
  assert.match(code(source(import.meta.url, FILE)), /endsWith\(\s*"\.com"\s*\)/, "השאר endsWith(\".com\") — הבעיה הייתה הרווחים, לא הבדיקה");
});
