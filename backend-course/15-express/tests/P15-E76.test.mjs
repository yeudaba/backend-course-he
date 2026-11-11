import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typeProbe } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E76.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["contactSchema"])).contactSchema;
const base = { name: "דנה", email: "dana@example.com", message: "שלום, יש לי שאלה" };
const fails = (schema, input) => {
  const r = schema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.path.join("."));
};

test("עובר בדיקת טיפוסים, ו־Contact הוא הטיפוס של התוצאה", () => {
  typesOk(import.meta.url, FILE);
  const p = typeProbe(import.meta.url, FILE, `import { type Contact } from "FILE";
const c: Contact = { name: "a", email: "a@b.co", topic: "general", message: "x" };
const t: "general" | "billing" | "support" = c.topic;
// @ts-expect-error — topic חובה בתוצאה (יש לו ברירת מחדל)
const d: Contact = { name: "a", email: "a@b.co", message: "x" };
// @ts-expect-error — topic רק מהרשימה
const e: Contact = { name: "a", email: "a@b.co", topic: "sales", message: "x" };
`);
  assert.ok(p.ok, p.message);
});
test("ניקוי וברירות מחדל", async () => {
  const s = await get();
  assert.deepEqual(s.parse({ name: "  דנה  ", email: "Dana@Example.COM", message: "  שלום, יש לי שאלה  ", extra: 1 }), {
    name: "דנה",
    email: "dana@example.com",
    topic: "general",
    message: "שלום, יש לי שאלה",
  });
  assert.deepEqual(s.parse({ ...base, phone: "0501234567", topic: "billing" }), { ...base, phone: "0501234567", topic: "billing" });
  assert.equal(s.parse({ ...base, phone: "031234567" }).phone, "031234567", "9 ספרות תקין");
});
test("שדות לא תקינים", async () => {
  const s = await get();
  assert.deepEqual(fails(s, { ...base, name: " ד " }), ["name"]);
  assert.deepEqual(fails(s, { ...base, name: "x".repeat(51) }), ["name"]);
  assert.deepEqual(fails(s, { ...base, email: "dana" }), ["email"]);
  for (const phone of ["050-1234567", "12345678", "05012345678", "tel:0501234567", "0501234567 "]) {
    assert.deepEqual(fails(s, { ...base, phone }), ["phone"], `phone: ${phone}`);
  }
  assert.deepEqual(fails(s, { ...base, topic: "sales" }), ["topic"]);
  assert.deepEqual(fails(s, { ...base, message: "   קצר    " }), ["message"], "trim לפני min");
  assert.deepEqual(fails(s, { ...base, message: "x".repeat(1001) }), ["message"]);
  assert.equal(s.safeParse({ ...base, message: "x".repeat(1000) }).success, true);
});
