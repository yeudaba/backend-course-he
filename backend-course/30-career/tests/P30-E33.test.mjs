import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P30-E33.ts";
const get = () => exportsOf(import.meta.url, FILE, ["compare", "satisfies"]);

// כל התשובות כאן זהות לחבילת semver של npm (נבדק מולה)
const CASES = [
  ["5.1.2", "^5.0.0", true],
  ["5.0.0", "^5.0.0", true],
  ["6.0.0", "^5.0.0", false],
  ["4.9.9", "^5.0.0", false],
  ["0.3.9", "^0.3.1", true],
  ["0.4.0", "^0.3.1", false],
  ["0.3.0", "^0.3.1", false],
  ["0.0.3", "^0.0.3", true],
  ["0.0.4", "^0.0.3", false],
  ["1.4.9", "~1.4.2", true],
  ["1.5.0", "~1.4.2", false],
  ["1.4.1", "~1.4.2", false],
  ["0.2.7", "~0.2.3", true],
  ["22.11.0", ">=20.0.0 <23.0.0", true],
  ["23.0.0", ">=20.0.0 <23.0.0", false],
  ["20.0.0", ">=20.0.0", true],
  ["20.0.0", ">20.0.0", false],
  ["2.0.0", "<=2.0.0", true],
  ["1.2.3", "1.2.3", true],
  ["1.2.3", "=1.2.3", true],
  ["1.2.4", "1.2.3", false],
  ["v24.1.0", ">=20.0.0 <23.0.0", false],
  ["1.10.0", ">1.9.0", true],
];

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("compare — מספרית, לא כטקסט", async () => {
  const { compare } = await get();
  assert.equal(compare("1.10.0", "1.9.0"), 1, "10 > 9 — כמספר. כטקסט '1.10.0' < '1.9.0'");
  assert.equal(compare("1.2.3", "1.2.3"), 0);
  assert.equal(compare("1.2.3", "1.3.0"), -1);
  assert.equal(compare("v2.0.0", "2.0.0"), 0, "v בהתחלה מותר");
  assert.equal(compare("0.0.1", "0.0.0"), 1);
  for (const bad of ["1.2", "1.2.3.4", "a.b.c", "1.2.x"]) assert.throws(() => compare(bad, "1.0.0"), SyntaxError, bad);
});
test("satisfies — ^, ~, השוואות, ורווח = וגם", async () => {
  const { satisfies } = await get();
  for (const [v, range, expected] of CASES) assert.equal(satisfies(v, range), expected, `${v} ב־"${range}"`);
});
test("טווח לא תקין ← SyntaxError", async () => {
  const { satisfies } = await get();
  for (const bad of ["^1.2", "!=1.0.0", ">= banana"]) assert.throws(() => satisfies("1.0.0", bad), SyntaxError, bad);
});
