import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P29.5-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["validate"])).validate;
// בודקים את הנתיבים (מה שלפני הנקודתיים) — הניסוח של ההודעה שלך
const paths = (errors) => errors.map((e) => e.split(": ")[0]).sort();

const ORDER = {
  type: "object",
  required: ["customerEmail", "items"],
  properties: {
    customerEmail: { type: "string" },
    items: { type: "array", items: { type: "object", required: ["productId", "qty"], properties: { productId: { type: "integer" }, qty: { type: "integer", minimum: 1, maximum: 10 } } } },
    shipping: { type: "string", enum: ["standard", "express"] },
    gift: { type: "boolean" },
    price: { type: "number", minimum: 0 },
  },
};

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("קלט תקין ← []", async () => {
  const validate = await get();
  assert.deepEqual(validate(ORDER, { customerEmail: "d@x.com", items: [{ productId: 3, qty: 2 }] }), []);
  assert.deepEqual(validate(ORDER, { customerEmail: "d@x.com", items: [], shipping: "express", gift: false, price: 0.5 }), []);
});
test("כל השגיאות, עם נתיב מלא", async () => {
  const validate = await get();
  const errors = validate(ORDER, { items: [{ productId: 3, qty: 0 }, { productId: "4", qty: 1.5 }], shipping: "drone", discount: 100 });
  assert.ok(errors.every((e) => /^input[.[]/.test(e) && e.includes(": ")), `כל שגיאה: "נתיב: הסבר" (קיבלנו ${JSON.stringify(errors)})`);
  assert.deepEqual(paths(errors), ["input.customerEmail", "input.discount", "input.items[0].qty", "input.items[1].productId", "input.items[1].qty", "input.shipping"]);
});
test("טיפוסים: string, number, integer, boolean, array, object", async () => {
  const validate = await get();
  assert.deepEqual(paths(validate({ type: "string" }, 5)), ["input"]);
  assert.deepEqual(paths(validate({ type: "number" }, "5")), ["input"]);
  assert.deepEqual(paths(validate({ type: "number" }, NaN)), ["input"], "NaN הוא לא מספר תקין");
  assert.deepEqual(validate({ type: "number", maximum: 5 }, 5), [], "maximum כולל");
  assert.deepEqual(paths(validate({ type: "number", maximum: 5 }, 5.01)), ["input"]);
  assert.deepEqual(paths(validate({ type: "integer" }, 2.5)), ["input"]);
  assert.deepEqual(paths(validate({ type: "boolean" }, "true")), ["input"], '"true" הוא מחרוזת');
  assert.deepEqual(paths(validate({ type: "array", items: { type: "string" } }, "a,b")), ["input"]);
  assert.deepEqual(paths(validate({ type: "array", items: { type: "string" } }, ["a", 1, "c", 2])), ["input[1]", "input[3]"]);
  for (const bad of [null, [], "x"]) assert.deepEqual(paths(validate({ type: "object", properties: {} }, bad)), ["input"], `${JSON.stringify(bad)} הוא לא object`);
  assert.deepEqual(paths(validate({ type: "object", properties: { a: { type: "object", properties: { b: { type: "string" } }, required: ["b"] } } }, { a: {} })), ["input.a.b"], "רקורסיה: אובייקט בתוך אובייקט");
});
