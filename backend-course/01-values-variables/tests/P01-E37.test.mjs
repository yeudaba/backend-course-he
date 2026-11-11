import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E37.js";
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["הזמנה מספר: 1042", "סוג מספר ההזמנה: number", "פריט ראשון: 35", "פריט שני: 12.5", "סה״כ: 47.5", "נשלחה: false"]);
});

test("מספרים, בוליאני ושם הסוג — לא בתוך מירכאות", () => {
  const bad = strings(source(import.meta.url, FILE)).filter((s) => /\d|true|false|number/.test(s));
  assert.deepEqual(bad, [], "יש מחרוזות עם מספר, false או number — כתוב אותם כערכים (ואת הסוג — עם typeof)");
});

test("הסה״כ מחושב, לא כתוב", () => {
  assert.ok(!/47\.5/.test(bare(source(import.meta.url, FILE))), "47.5 כתוב בקוד — כתוב את החשבון 35 + 12.5");
});
