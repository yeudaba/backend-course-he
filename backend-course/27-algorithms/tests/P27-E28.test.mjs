import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { fastEnough } from "./_perf.mjs";

const FILE = "P27-E28.ts";
const get = () => exportsOf(import.meta.url, FILE, ["compress", "decompress"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("compress", async () => {
  const { compress } = await get();
  assert.equal(compress("aaabccdddd"), "a3bc2d4");
  assert.equal(compress("abc"), "abc", "תו בודד — בלי 1");
  assert.equal(compress(""), "");
  assert.equal(compress("zzzzzzzzzzzz"), "z12", "רצף של יותר מ־9 — מספר עם כמה ספרות");
  assert.equal(compress("aabaa"), "a2ba2", "אותו תו בשני רצפים נפרדים");
  assert.equal(compress("  !!"), " 2!2");
  assert.throws(() => compress("a1"), TypeError, "טקסט עם ספרות — אי אפשר לפתוח אותו אחר כך");
});
test("decompress", async () => {
  const { decompress } = await get();
  assert.equal(decompress("a3bc2d4"), "aaabccdddd");
  assert.equal(decompress("z12"), "z".repeat(12));
  assert.equal(decompress(""), "");
  assert.equal(decompress("ab"), "ab");
  for (const bad of ["3a", "a0", "a05"]) assert.throws(() => decompress(bad), SyntaxError, bad);
});
test("הלוך וחזור, ו־200,000 תווים מהר", async () => {
  const { compress, decompress } = await get();
  for (const s of ["mississippi", "aaaaaaaaaaaaaaaaaaaaaaab", "xyz", "q"]) assert.equal(decompress(compress(s)), s, s);
  const big = "ab".repeat(50_000) + "c".repeat(100_000);
  const c = fastEnough(() => compress(big), 500, "compress על 200,000 תווים");
  assert.equal(c.length, 100_000 + 7);
  assert.equal(fastEnough(() => decompress(c), 500, "decompress"), big);
});
