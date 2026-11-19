// P22-E06 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "./P22-E06.ts";

test("אותיות קטנות, ורווח ← מקף", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("רצף של סימנים ← מקף אחד", () => {
  assert.equal(slugify("Node.js -- 24!!"), "node-js-24");
});

test("בלי מקפים בהתחלה ובסוף", () => {
  assert.equal(slugify("  ...Learn Express!  "), "learn-express");
});

test("ספרות נשארות", () => {
  assert.equal(slugify("Node 22"), "node-22");
});

test("רק סימנים ← מחרוזת ריקה", () => {
  assert.equal(slugify("!!!"), "");
  assert.equal(slugify(""), "");
});
