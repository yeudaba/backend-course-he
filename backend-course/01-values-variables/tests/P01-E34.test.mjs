import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source } from "./_out.mjs";

const FILE = "P01-E34.js";

test("מודפסים רק שלב 1 ושלב 4", () => {
  sameOutput(run(import.meta.url, FILE), ["שלב 1: התחברות", "שלב 4: אישור"]);
});

test("שלב 2 ושלב 3 כתובים — וכבויים בהערה אחת של /* ... */", () => {
  const src = source(import.meta.url, FILE);
  const blocks = [...src.matchAll(/\/\*[\s\S]*?\*\//g)].map((m) => m[0]);
  const both = blocks.find((b) => /console\.log\(\s*["']שלב 2: בחירת מוצר["']\s*\)/.test(b) && /console\.log\(\s*["']שלב 3: תשלום["']\s*\)/.test(b));
  assert.ok(both, "לא מצאנו הערת /* ... */ אחת שבתוכה גם השורה של שלב 2 וגם השורה של שלב 3");
  assert.ok(!/^\s*\/\/\s*console\.log/m.test(src), "מצאנו שורה שכובתה עם // — במשימה הזו מכבים עם /* ... */ בלבד");
});
