import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E21-order.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["משלוח ל: אורי", "דמי משלוח: 0"]);
});

test("deliveryFee מוגדר פעם אחת בלבד", () => {
  const n = (code(source(import.meta.url, FILE)).match(/(let|const|var)\s+deliveryFee\b/g) ?? []).length;
  assert.equal(n, 1, `מצאנו ${n} הגדרות של deliveryFee — משתנה מגדירים פעם אחת, ואחר כך רק מציבים לו ערך חדש`);
});
