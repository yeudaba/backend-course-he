import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P01-E26.js";
const withValue = (v) => run(import.meta.url, FILE, { changes: [[/const\s+value\s*=\s*42\s*;?/, `const value = ${v};`, "את השורה const value = 42;"]] });

test("value = 42 ← ערך: 42 | סוג: number", () => {
  sameOutput(run(import.meta.url, FILE), ["ערך: 42 | סוג: number"]);
});

test('value = "שלום" ← סוג: string', () => {
  sameOutput(withValue('"שלום"'), ["ערך: שלום | סוג: string"]);
});

test("value = true ← סוג: boolean", () => {
  sameOutput(withValue("true"), ["ערך: true | סוג: boolean"]);
});

test("value = null ← סוג: object (המוזרות של typeof null)", () => {
  sameOutput(withValue("null"), ["ערך: null | סוג: object"]);
});
