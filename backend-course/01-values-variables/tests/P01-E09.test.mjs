import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E09.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["כניסות: 1", "כניסות: 2", "כניסות: 3"]);
});

test("המונה מוגדר עם let, פעם אחת בלבד", () => {
  const decl = code(source(import.meta.url, FILE)).match(/\b(let|const|var)\s+loginCount\b/g) ?? [];
  assert.deepEqual(decl, ["let loginCount"], "צריך הגדרה אחת בדיוק: let loginCount = 0;");
});

test("המונה באמת גדל (מתחילים מ־10 ← מקבלים 11, 12, 13)", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(let\s+loginCount\s*=\s*)0\b/, "$110", "את השורה let loginCount = 0"]] });
  sameOutput(r, ["כניסות: 11", "כניסות: 12", "כניסות: 13"]);
});
