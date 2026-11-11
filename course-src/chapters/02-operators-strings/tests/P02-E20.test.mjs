import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P02-E20-cart-total.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["כמות: 2", "מחיר ליחידה: 125", "סה״כ: 250", "כולל משלוח (30): 280"]);
});

test("עובד גם עם כמות אחרת", () => {
  sameOutput(run(import.meta.url, FILE, { changes: [['"2"', '"3"', 'את הכמות "2"']] }), ["כמות: 3", "מחיר ליחידה: 125", "סה״כ: 375", "כולל משלוח (30): 405"]);
});

test("הבאג הרדום: שני הקלטים מומרים למספרים", () => {
  const c = code(source(import.meta.url, FILE));
  for (const name of ["quantityInput", "unitPriceInput"]) {
    assert.match(c, new RegExp(`(Number|parseInt|parseFloat)\\(\\s*${name}\\b|(^|[=(,]\\s*)\\+\\s*${name}\\b`, "m"), `${name} עדיין טקסט — המר אותו למספר (Number) לפני החישוב`);
  }
});
