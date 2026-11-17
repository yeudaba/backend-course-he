import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E36.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["42 number", "42 string", "true boolean", "true string"]);
});

test("שמות הסוגים מחושבים עם typeof — לא כתובים בידיים", () => {
  const src = source(import.meta.url, FILE);
  const bad = strings(src).filter((s) => /number|string|boolean/.test(s));
  assert.deepEqual(bad, [], "כתבת שם של סוג בתוך מירכאות — השתמש ב־typeof");
  const count = code(src).match(/\btypeof\b/g)?.length ?? 0;
  assert.ok(count >= 4, `מצאנו typeof רק ${count} פעמים — צריך אחד בכל שורה`);
});
