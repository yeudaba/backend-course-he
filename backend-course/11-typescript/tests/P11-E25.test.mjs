import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { string, number, boolean, optional, array, object } = await load(import.meta.url, "P11-E25.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E25.ts"); assert.ok(r.ok, r.output); });
test("פרימיטיביים", () => {
  assert.deepEqual(string({ min: 2 })("ab"), { ok: true, value: "ab" });
  assert.deepEqual(string({ min: 3 })("ab"), { ok: false, error: "לפחות 3 תווים" });
  assert.deepEqual(string()(5, "name"), { ok: false, error: "name: חייב להיות מחרוזת" });
  assert.deepEqual(number({ integer: true })(1.5, "qty"), { ok: false, error: "qty: חייב להיות מספר שלם" });
  assert.deepEqual(number({ max: 10 })(11), { ok: false, error: "לכל היותר 10" });
  assert.deepEqual(number()(NaN), { ok: false, error: "חייב להיות מספר" });
  assert.deepEqual(boolean()("true"), { ok: false, error: "חייב להיות true או false" });
});
test("optional ו־array", () => {
  assert.deepEqual(optional(string())(undefined), { ok: true, value: undefined });
  assert.deepEqual(array(number())([1, 2]), { ok: true, value: [1, 2] });
  assert.deepEqual(array(number())([1, "x"], "nums"), { ok: false, error: "nums[1]: חייב להיות מספר" });
});
test("object — נתיבים ושדות מיותרים", () => {
  const schema = object({ email: string({ min: 3 }), note: optional(string()), items: array(object({ sku: string(), qty: number({ min: 1, integer: true }) })) });
  assert.deepEqual(schema({ email: "a@b.c", items: [{ sku: "A", qty: 2, x: 1 }], hacker: true }), { ok: true, value: { email: "a@b.c", items: [{ sku: "A", qty: 2 }] } });
  assert.deepEqual(schema({ email: "a@b.c", items: [{ sku: "A", qty: 2 }, { sku: "B", qty: 1.5 }] }), { ok: false, error: "items[1].qty: חייב להיות מספר שלם" });
  assert.deepEqual(schema(null), { ok: false, error: "חייב להיות אובייקט" });
  assert.deepEqual(schema({ items: [] }), { ok: false, error: "email: חייב להיות מחרוזת" });
});
