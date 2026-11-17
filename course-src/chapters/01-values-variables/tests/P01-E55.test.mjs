import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E55.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["כינוי: undefined", "סוג: undefined", "כינוי: דני", "סוג: string"]);
});

test("nickname מוגדר פעם אחת, בלי ערך, ו־undefined לא כתוב בידיים", () => {
  const src = source(import.meta.url, FILE);
  const c = code(src);
  assert.equal(c.match(/\blet\s+nickname\b/g)?.length ?? 0, 1, "צריך בדיוק הגדרה אחת: let nickname;");
  assert.match(c, /let\s+nickname\s*;/, "הגדר את nickname בלי ערך התחלתי: let nickname;");
  assert.ok(!/\bundefined\b/.test(c.replace(/"[^"\n]*"|'[^'\n]*'/g, "")), "כתבת undefined בקוד — JavaScript שמה אותו לבד");
  const bad = strings(src).filter((s) => /undefined|string/.test(s));
  assert.deepEqual(bad, [], "כתבת undefined או string בתוך מירכאות — הדפס את המשתנה עצמו ואת typeof שלו");
});

test('עם הכינוי "רוני" — השורה השלישית משתנה', () => {
  const r = run(import.meta.url, FILE, { changes: [[/(nickname\s*=\s*)["']דני["']/, '$1"רוני"', 'את nickname = "דני"']] });
  sameOutput(r, ["כינוי: undefined", "סוג: undefined", "כינוי: רוני", "סוג: string"]);
});
