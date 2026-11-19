import { test } from "node:test";
import assert from "node:assert/strict";
import { lint, load } from "../../tools/load.mjs";

const { roundPrice, priceWithVat, isFree } = await load(import.meta.url, "P08-E23.js");

test("priceWithVat", () => { assert.equal(priceWithVat(100), 118); assert.equal(priceWithVat(10, 0.17), 11.7); });
test("isFree", () => { assert.equal(isFree("0"), true); assert.equal(isFree(0), true); assert.equal(isFree(""), false); assert.equal(isFree(" "), false); assert.equal(isFree(5), false); });
test("ESLint נקי (המשימה: גם npx eslint וגם הבודק)", async () => {
  const problems = await lint(import.meta.url, "P08-E23.js");
  const list = problems.map((p) => `שורה ${p.line}: ${p.rule ?? ""} — ${p.message}`).join(" | ");
  assert.ok(problems.length === 0, `ESLint מצא ${problems.length} בעיות: ${list}`);
});
