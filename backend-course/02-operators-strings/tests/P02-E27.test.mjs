import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E27.js";
const withEmail = (v) => run(import.meta.url, FILE, { changes: [[/(email\s*=\s*)(["'`]).*?\2/, `$1"${v}"`, "את השורה const email = ...;"]] });

test("האימייל מהתרגיל", () => {
  sameOutput(run(import.meta.url, FILE), ["משתמש: dana.levi", "דומיין: example.com"]);
});

test("אימייל אחר, עם רווחים ואותיות גדולות", () => {
  sameOutput(withEmail("   Yossi@Gmail.CO.IL "), ["משתמש: yossi", "דומיין: gmail.co.il"]);
});

test("שם משתמש ארוך עם ספרות", () => {
  sameOutput(withEmail("Support2026@Shop.example.com"), ["משתמש: support2026", "דומיין: shop.example.com"]);
});
