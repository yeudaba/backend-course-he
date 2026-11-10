import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E11.js";

test("הפלט לא השתנה", () => sameOutput(run(import.meta.url, FILE), ["מחובר | משלוח 20 | 3 הודעות"]));

test("עם ערכים הפוכים (לא מחובר, אקספרס, הודעה אחת)", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(isOnline\s*=\s*)true/, "$1false", "את const isOnline = true"],
      [/(isExpress\s*=\s*)false/, "$1true", "את const isExpress = false"],
      [/(count\s*=\s*)3\b/, "$11", "את const count = 3"],
    ],
  });
  sameOutput(r, ["לא מחובר | משלוח 40 | 1 הודעה"]);
});

test("בלי let ובלי if — רק const ו־ternary", () => {
  const src = code(source(import.meta.url, FILE));
  assert.ok(!/\blet\b/.test(src), "עדיין יש let בקוד");
  assert.ok(!/\bif\s*\(/.test(src), "עדיין יש if בקוד");
  assert.ok((src.match(/\?/g)?.length ?? 0) >= 3, "צריך שלושה ternary (? :)");
});
