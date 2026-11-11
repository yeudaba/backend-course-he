import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E08.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מוצר: מטען נייד", "מחיר: 129", "משלוח חינם: false"]);
});

test("הערכים לא כתובים בתוך שורות ה־console.log", () => {
  const logs = code(source(import.meta.url, FILE)).split("\n").filter((l) => l.includes("console.log"));
  for (const l of logs) {
    assert.ok(!/מטען נייד|129|false/.test(l), `בשורה "${l.trim()}" כתוב ערך. השתמש בשם המשתנה`);
  }
});

test("שינוי המחיר במקום אחד משנה את הפלט (המחיר שמור במשתנה)", () => {
  const r = run(import.meta.url, FILE, { changes: [[/=\s*129\b/, "= 150", "את ההגדרה של המחיר (= 129)"]] });
  sameOutput(r, ["מוצר: מטען נייד", "מחיר: 150", "משלוח חינם: false"]);
});
