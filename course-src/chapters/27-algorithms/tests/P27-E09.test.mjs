import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { checkBrackets } = await load(import.meta.url, "P27-E09.ts");

test("מאוזן", () => {
  assert.deepEqual(checkBrackets(""), { ok: true });
  assert.deepEqual(checkBrackets("{ items: [1, (2 + 3)] }"), { ok: true });
  assert.deepEqual(checkBrackets("([]{})"), { ok: true });
});
test("סוגר שלא מתאים / שאין לו פותח — האינדקס שלו", () => {
  assert.deepEqual(checkBrackets("([)]"), { ok: false, index: 2 });
  assert.deepEqual(checkBrackets("a)b"), { ok: false, index: 1 });
  assert.deepEqual(checkBrackets("{ a: [1, 2 }"), { ok: false, index: 11 });
});
test("פותח שלא נסגר — האינדקס של הפותח הראשון שנשאר פתוח", () => {
  assert.deepEqual(checkBrackets("(()"), { ok: false, index: 0 });
  assert.deepEqual(checkBrackets("ok [ fine ] ( {"), { ok: false, index: 12 });
});
test("מחרוזת של 200,000 תווים — מהר", () => {
  const s = "(".repeat(100_000) + ")".repeat(100_000);
  fastEnough(() => assert.deepEqual(checkBrackets(s), { ok: true }), 300, "checkBrackets על 200,000 תווים");
});
