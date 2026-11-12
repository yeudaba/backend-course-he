import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P21-E44.ts", ["registerSchema", "parseRegister"]);

test("תקין — מנורמל", async () => {
  const { parseRegister, registerSchema } = await get();
  assert.deepEqual(parseRegister({ email: "  Dana@Example.COM ", password: "correct horse " }), { ok: true, data: { email: "dana@example.com", password: "correct horse " } }, "אימייל: trim + אותיות קטנות. סיסמה: בלי trim");
  assert.equal(typeof registerSchema.safeParse, "function", "registerSchema היא סכמה של Zod");
  assert.deepEqual(parseRegister({ email: "a@b.co", password: "ש".repeat(36) }).ok, true, "36 אותיות עבריות = 72 בתים — בדיוק בגבול");
});
test("שגיאות", async () => {
  const { parseRegister } = await get();
  assert.deepEqual(parseRegister({ email: "a@b.co", password: "short" }), { ok: false, errors: ["password: לפחות 8 תווים"] });
  assert.deepEqual(parseRegister({ email: "a@b.co", password: "ש".repeat(37) }), { ok: false, errors: ["password: עד 72 בתים"] }, "37 אותיות = 74 בתים, למרות ש־length הוא 37");
  assert.deepEqual(parseRegister({ email: "a@b.co", password: "🔒".repeat(19) }), { ok: false, errors: ["password: עד 72 בתים"] });
  const r = parseRegister({ email: "not-an-email", password: "long-enough" });
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /^email: /);
});
test("שדה לא מוכר ← שגיאה (strict)", async () => {
  const { parseRegister } = await get();
  const r = parseRegister({ email: "a@b.co", password: "long-enough", role: "admin" });
  assert.equal(r.ok, false, "role בגוף ההרשמה — חייב להידחות (z.strictObject)");
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /role/);
  assert.doesNotMatch(r.errors[0], /^: /, "בלי path — רק ההודעה");
  assert.equal(parseRegister(null).ok, false);
  assert.equal(parseRegister({ email: "a@b.co" }).ok, false);
});
