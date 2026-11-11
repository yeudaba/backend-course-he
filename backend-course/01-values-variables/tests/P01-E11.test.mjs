import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E11-fill.js";

test("הפלט זהה לפלט שבהערה", () => {
  sameOutput(run(import.meta.url, FILE), ["שם: נועה", "גיל: 29", "מנויה: true"]);
});

test("הגיל הוא מספר והמנוי הוא בוליאני (לא טקסט)", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /age\s*=\s*29\b/, "const age = 29; — בלי מירכאות");
  assert.match(src, /isSubscriber\s*=\s*true\b/, "const isSubscriber = true; — בלי מירכאות");
});
