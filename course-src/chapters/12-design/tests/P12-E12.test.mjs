import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { parseCreateUser, ValidationError } = await load(import.meta.url, "P12-E12.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E12.ts"); assert.ok(r.ok, r.output); });
test("תקין ומנורמל, בלי שדות מיותרים", () => { assert.deepEqual(parseCreateUser({ email: " Dana@X.com ", name: " דנה ", role: "admin" }), { email: "dana@x.com", name: "דנה" }); assert.deepEqual(parseCreateUser({ email: "a@b", name: "x", age: 30 }), { email: "a@b", name: "x", age: 30 }); });
test("שגיאות עם שדה", () => {
  assert.throws(() => parseCreateUser(null), { field: "body", message: "חייב להיות אובייקט" });
  assert.throws(() => parseCreateUser([]), { field: "body" });
  assert.throws(() => parseCreateUser({ email: "x", name: "a" }), { field: "email", message: "אימייל לא תקין" });
  assert.throws(() => parseCreateUser({ email: "a@b", name: "  " }), { field: "name", message: "שם חובה" });
  assert.throws(() => parseCreateUser({ email: "a@b", name: "a", age: 12 }), { field: "age", message: "גיל לא תקין" });
  assert.throws(() => parseCreateUser({ email: "a@b", name: "a", age: "30" }), { field: "age" });
});
test("זורק ValidationError", () => assert.throws(() => parseCreateUser({}), ValidationError));
