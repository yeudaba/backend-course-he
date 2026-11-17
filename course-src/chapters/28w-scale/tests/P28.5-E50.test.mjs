import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { escapeRegex, buildSearch } = await load(import.meta.url, "P28.5-E50.ts");

test("escapeRegex — התאמה מילולית", () => {
  for (const s of ["a.b", "1+1=2", "(x)", "[a-z]*", "c:\\dir", "^$", "a|b", "{3}", "what?", "/path/"]) {
    const re = new RegExp(`^${escapeRegex(s)}$`);
    assert.ok(re.test(s), s);
  }
  assert.ok(!new RegExp(`^${escapeRegex("a.b")}$`).test("axb"));
  assert.equal(escapeRegex("abc 123"), "abc 123");
});
test("buildSearch — כל המילים, בכל סדר, בלי אותיות", () => {
  const re = buildSearch("  latte   OAT ");
  assert.ok(re.test("Oat Milk Latte"));
  assert.ok(re.test("latte with oat"));
  assert.ok(!re.test("Latte"));
  const re2 = buildSearch("c++ (beans)");
  assert.ok(re2.test("C++ guide (beans)"));
  assert.ok(!re2.test("c guide beans"));
});
test("לא תקין", () => {
  assert.throws(() => buildSearch("   "), RangeError);
  assert.throws(() => buildSearch("x".repeat(51)), RangeError);
  buildSearch("x".repeat(50));
});
test("קלט זדוני לא נתקע", () => {
  const re = buildSearch("(a+)+$");
  const t0 = performance.now();
  assert.equal(re.test("a".repeat(5000) + "!"), false);
  assert.ok(performance.now() - t0 < 200);
});
