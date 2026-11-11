import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P02-E12.js";

test("ארבעה מחירים, תמיד שתי ספרות אחרי הנקודה", () => {
  sameOutput(run(import.meta.url, FILE), ["₪ 5.00", "₪ 19.90", "₪ 1249.50", "₪ 0.33"]);
});

test("משתנה אחד, price, והעיצוב עם toFixed", () => {
  const src = source(import.meta.url, FILE);
  const decl = code(src).match(/\b(let|const|var)\s+price\b/g) ?? [];
  assert.deepEqual(decl, ["let price"], "הגדר let price פעם אחת, ושנה אותו בין ההדפסות");
  assert.match(code(src), /toFixed\(2\)/, "השתמש ב־toFixed(2)");
  assert.ok(!strings(src).some((s) => /\d/.test(s)), "יש מספר בתוך מחרוזת — המחירים צריכים להגיע מ־price");
});
