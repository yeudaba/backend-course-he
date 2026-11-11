import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E06.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["מוצר: עט מחיר: 7.5", "כמות: 3 במלאי: true", "סוג המחיר: number"]);
});

test("בדיוק שלוש שורות קוד", () => {
  const lines = code(source(import.meta.url, FILE)).split("\n").filter((l) => l.trim() !== "");
  assert.equal(lines.length, 3, `מצאנו ${lines.length} שורות קוד — המשימה מבקשת שלוש`);
});

test("המספרים והבוליאני הם ערכים, לא טקסט בתוך מירכאות", () => {
  const bad = strings(source(import.meta.url, FILE)).filter((s) => /\d|true|number/.test(s));
  assert.deepEqual(bad, [], "יש מחרוזות שמכילות מספר, true או number — כתוב אותם כערכים (7.5, true, typeof)");
});
