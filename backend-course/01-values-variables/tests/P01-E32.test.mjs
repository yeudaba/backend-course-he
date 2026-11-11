import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E32.js";

test("הפלט: string, number, boolean", () => {
  sameOutput(run(import.meta.url, FILE), ["string", "number", "boolean"]);
});

test("את שמות הסוגים JavaScript מחשבת — לא אתה", () => {
  const bad = strings(source(import.meta.url, FILE)).filter((s) => /string|number|boolean/.test(s));
  assert.deepEqual(bad, [], "כתבת את שם הסוג בתוך מירכאות — השתמש ב־typeof, שיחשב אותו");
  const count = code(source(import.meta.url, FILE)).match(/\btypeof\b/g)?.length ?? 0;
  assert.ok(count >= 3, `מצאנו typeof רק ${count} פעמים — צריך אחד בכל שורה`);
});

test('אם מחליפים את 12 ב־"12" — השורה השנייה הופכת ל־string', () => {
  const r = run(import.meta.url, FILE, { changes: [[/(typeof\s*\(?\s*)12\b/, '$1"12"', "את typeof 12"]] });
  sameOutput(r, ["string", "string", "boolean"]);
});
