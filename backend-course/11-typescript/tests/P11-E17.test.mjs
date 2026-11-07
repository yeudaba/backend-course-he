import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { ok, fail, parseAge, sumResults } = await load(import.meta.url, "P11-E17.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E17.ts"); assert.ok(r.ok, r.output); });
test("ok / fail", () => { assert.deepEqual(ok(1), { ok: true, value: 1 }); assert.deepEqual(fail("x"), { ok: false, error: "x" }); });
test("parseAge", () => {
  assert.deepEqual(parseAge("30"), { ok: true, value: 30 });
  assert.deepEqual(parseAge("abc"), { ok: false, error: "לא מספר" });
  assert.deepEqual(parseAge(""), { ok: false, error: "לא מספר" });
  assert.deepEqual(parseAge("2.5"), { ok: false, error: "לא מספר" });
  assert.deepEqual(parseAge("500"), { ok: false, error: "מחוץ לטווח" });
});
test("sumResults", () => {
  assert.deepEqual(sumResults([ok(1), ok(2)]), { ok: true, value: 3 });
  assert.deepEqual(sumResults([ok(1), fail("a"), fail("b")]), { ok: false, error: "a" });
  assert.deepEqual(sumResults([]), { ok: true, value: 0 });
});
