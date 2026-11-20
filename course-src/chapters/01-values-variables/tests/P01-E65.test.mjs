import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, strings } from "./_out.mjs";

const FILE = "P01-E65.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["קפה הפינה", "קפה: 12 ש״ח, מאפה: 8 ש״ח", "סה״כ: 20", "סוג המחיר: number", "שולם: true"]);
});

test("הסה״כ מחושב: מחיר קפה אחר ← סה״כ אחר", () => {
  const r = run(import.meta.url, FILE, { changes: [[/12\s*\+\s*8/, "15 + 8", "את החשבון 12 + 8"]] });
  assert.equal(r.lines[2], "סה״כ: 23", "כשהקפה עולה 15 הסה״כ צריך להיות 23 — האם החשבון הוא בין מספרים (בלי מירכאות)?");
});

test("מספרים ובוליאני — ערכים, לא טקסט", () => {
  const bad = strings(source(import.meta.url, FILE)).filter((s) => /\d|true|number/.test(s));
  assert.deepEqual(bad, [], "יש מחרוזת עם מספר או true — כתוב אותם כערכים, בלי מירכאות");
});
