import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { validationError, validateSignup } = await load(import.meta.url, "P08-E13.js");

test("validationError", () => {
  const e = validationError("email", "אימייל לא תקין");
  assert.ok(e instanceof Error);
  assert.equal(e.message, "אימייל לא תקין");
  assert.equal(e.field, "email");
  assert.equal(e.code, "VALIDATION");
  assert.equal(e.status, 400);
});
test("validateSignup תקין", () => { assert.equal(validateSignup({ email: "a@b.c", password: "12345678" }), true); assert.equal(validateSignup({ email: "a@b.c", password: "12345678", age: 30 }), true); });
test("שגיאות לפי הסדר", () => {
  assert.throws(() => validateSignup({ email: "x", password: "1" }), { field: "email", message: "אימייל לא תקין" });
  assert.throws(() => validateSignup({ password: "12345678" }), { field: "email" });
  assert.throws(() => validateSignup({ email: "a@b.c", password: "123" }), { field: "password", message: "סיסמה קצרה מדי" });
  assert.throws(() => validateSignup({ email: "a@b.c", password: "12345678", age: 12 }), { field: "age", message: "גיל מינימלי 13", status: 400 });
});
