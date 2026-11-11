import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E21-off-by-one.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["חודשים: 1 2 3 4 5 6 7 8 9 10 11 12", "תווים: B-A-C-K", "סכום 1..10: 55"]);
});

test("עובד גם עם מילה אחרת", () => {
  const r = run(import.meta.url, FILE, { changes: [['"BACK"', '"NODE!"', 'את המילה "BACK"']] });
  sameOutput(r, ["חודשים: 1 2 3 4 5 6 7 8 9 10 11 12", "תווים: N-O-D-E-!", "סכום 1..10: 55"]);
});

test("לולאת הסכום מתחילה ב־1 ומסתיימת ב־10", () => {
  const c = code(source(import.meta.url, FILE));
  const loop = c.slice(c.indexOf("let sum"));
  assert.doesNotMatch(loop, /let\s+i\s*=\s*0/, "לולאת הסכום מתחילה מ־0 — הסכום יוצא נכון במקרה. התחל מ־1 (בדיקת הראשון!)");
});
