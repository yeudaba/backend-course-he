import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E07.js";

test("הפלט נשאר 30", () => {
  sameOutput(run(import.meta.url, FILE), ["30"]);
});

test("אין יותר שורות בצורה score = score ...", () => {
  const src = code(source(import.meta.url, FILE));
  assert.ok(!/score\s*=\s*score\b/.test(src), "עדיין יש שורה score = score ... — כתוב אותה בקיצור");
});

test("משתמשים בקיצורים: += ‏*= ‏/= ‏++ ו־--", () => {
  const src = code(source(import.meta.url, FILE));
  for (const op of ["+=", "*=", "/=", "++", "--"]) {
    assert.ok(src.includes(op), `לא מצאנו ${op} בקוד`);
  }
});
