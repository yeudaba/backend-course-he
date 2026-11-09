import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { load } from "../../tools/load.mjs";

const { reviewDiff } = await load(import.meta.url, "P30-E29.ts");
const sample = fs.readFileSync(new URL("../files/ai-diff.txt", import.meta.url), "utf8");

test("ה־diff לדוגמה (files/ai-diff.txt)", () => {
  assert.deepEqual(reviewDiff(sample), [
    { file: "src/orders.test.ts", line: 12, rule: "assertion-removed" },
    { file: "src/orders.test.ts", line: 13, rule: "test-disabled" },
    { file: "src/orders.test.ts", line: 40, rule: "type-escape" },
    { file: "package.json", line: 6, rule: "new-dependency" },
  ]);
});
const one = (file, hunk, body) => `diff --git a/${file} b/${file}\n--- a/${file}\n+++ b/${file}\n${hunk}\n${body}`;
test("eval ו־new Function", () => {
  const d = one("src/calc.ts", "@@ -1,2 +1,3 @@", " const a = 1;\n+const r = eval(expr);\n+const f = new Function('x', body);\n done();");
  assert.deepEqual(reviewDiff(d).map((f) => `${f.line}:${f.rule}`), ["2:dangerous-eval", "3:dangerous-eval"]);
});
test("test.only, describe.skip ו־@ts-ignore", () => {
  const d = one("src/a.test.ts", "@@ -7,1 +7,4 @@", " x\n+test.only(\"a\", () => {});\n+describe.skip(\"b\", () => {});\n+// @ts-ignore");
  assert.deepEqual(reviewDiff(d).map((f) => `${f.line}:${f.rule}`), ["8:test-disabled", "9:test-disabled", "10:type-escape"]);
});
test("לא מתריע על שורות תקינות, ועל version ב־package.json", () => {
  const d = one("package.json", "@@ -1,3 +1,3 @@", "-  \"version\": \"1.0.0\",\n+  \"version\": \"1.1.0\",\n   \"name\": \"x\"") + "\n" + one("src/b.ts", "@@ -3,1 +3,2 @@", " ok\n+const skipped = items.skip;");
  assert.deepEqual(reviewDiff(d), []);
});
test("assert שנמחק — לפי מספר השורה בקובץ הישן", () => {
  const d = one("t.test.mjs", "@@ -20,3 +20,1 @@", " a\n-  assert.equal(x, 1);\n-  foo();");
  assert.deepEqual(reviewDiff(d), [{ file: "t.test.mjs", line: 21, rule: "assertion-removed" }]);
});
