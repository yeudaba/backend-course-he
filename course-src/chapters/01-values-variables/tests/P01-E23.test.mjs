import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E23-old-code.js";

test("הפלט נשאר זהה", () => {
  sameOutput(run(import.meta.url, FILE), ["הספרייה של דני", "נמכרו: 3 הכנסות: 120"]);
});

test("ההכנסות מחושבות מהמחיר — גם כשהמחיר משתנה", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [["40", "50", "את המחיר 40"]] }), ["הספרייה של דני", "נמכרו: 3 הכנסות: 150"]);
});

test("בלי var, ו־const לכל מה שלא משתנה", () => {
  const c = code(source(import.meta.url, FILE));
  assert.doesNotMatch(c, /\bvar\b/, "עדיין יש var בקוד");
  assert.match(c, /const\s+storeName\b/, "storeName לא משתנה — const");
  assert.match(c, /const\s+bookPrice\b/, "bookPrice לא משתנה — const");
});

test("שמות לפי camelCase", () => {
  const names = [...code(source(import.meta.url, FILE)).matchAll(/\b(?:const|let)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
  const bad = names.filter((n) => !/^[a-z][a-zA-Z0-9]*$/.test(n));
  assert.deepEqual(bad, [], "שמות שלא לפי camelCase (מתחילים באות קטנה, בלי קו תחתון)");
});

test("bookPrice לא כתוב שלוש פעמים בחישוב", () => {
  const n = (code(source(import.meta.url, FILE)).match(/\bbookPrice\b/g) ?? []).length;
  assert.ok(n <= 2, `bookPrice מופיע ${n} פעמים — השתמש בכפל: bookPrice * booksSold`);
});
