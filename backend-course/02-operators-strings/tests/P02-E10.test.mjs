import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E10.js";

test("האימייל מהתרגיל", () => {
  sameOutput(run(import.meta.url, FILE), ["אימייל: yossi.cohen@gmail.com", "אורך: 21", "יש @? true", "נגמר ב־.com? true"]);
});

test("אימייל אחר — שלא נגמר ב־.com", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(rawEmail\s*=\s*)(["'`]).*?\2/, '$1"  Noa@Example.ORG "', "את השורה const rawEmail = ..."]] });
  sameOutput(r, ["אימייל: noa@example.org", "אורך: 15", "יש @? true", "נגמר ב־.com? false"]);
});

test("טקסט בלי @", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(rawEmail\s*=\s*)(["'`]).*?\2/, '$1" not-an-email.COM"', "את השורה const rawEmail = ..."]] });
  sameOutput(r, ["אימייל: not-an-email.com", "אורך: 16", "יש @? false", "נגמר ב־.com? true"]);
});
