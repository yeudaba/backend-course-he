import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { load } from "../../tools/load.mjs";

const { defineTool } = await load(import.meta.url, "P29.5-E07.ts");
const refund = () =>
  defineTool({
    name: "refund_order",
    description: "Refund an order",
    schema: z.object({ orderId: z.number().int().positive(), amountCents: z.number().int().positive(), reason: z.enum(["damaged", "late", "other"]) }),
    run: async ({ orderId, amountCents }) => `refunded ${amountCents} on ${orderId}`,
  });

test("definition: JSON Schema מ־zod, strict, בלי שדות נוספים", () => {
  const d = refund().definition;
  assert.equal(d.name, "refund_order");
  assert.equal(d.strict, true);
  assert.equal(d.input_schema.type, "object");
  assert.equal(d.input_schema.additionalProperties, false);
  assert.deepEqual([...d.input_schema.required].sort(), ["amountCents", "orderId", "reason"]);
  assert.deepEqual(d.input_schema.properties.reason.enum, ["damaged", "late", "other"]);
  assert.equal(d.input_schema.$schema, undefined, "בלי $schema");
});
test("execute: קלט תקין ← run", async () => {
  assert.deepEqual(await refund().execute({ orderId: 101, amountCents: 500, reason: "late" }), { content: "refunded 500 on 101" });
});
test("קלט לא תקין ← is_error עם הסבר שהמודל יכול לתקן לפיו", async () => {
  for (const bad of [{ orderId: "101", amountCents: 500, reason: "late" }, { orderId: 101, amountCents: -5, reason: "late" }, { orderId: 101, amountCents: 5, reason: "bored" }, { orderId: 101, amountCents: 5, reason: "late", admin: true }, null]) {
    const r = await refund().execute(bad);
    assert.equal(r.is_error, true, JSON.stringify(bad));
    assert.match(r.content, /קלט לא תקין/);
  }
  const r = await refund().execute({ orderId: 101, amountCents: -5, reason: "late" });
  assert.match(r.content, /amountCents/, "שם השדה הבעייתי בהודעה");
});
test("run שזורק ← is_error; שם לא חוקי ← שגיאה בהגדרה", async () => {
  const t = defineTool({ name: "x", description: "x", schema: z.object({}), run: async () => { throw new Error("timeout"); } });
  assert.deepEqual(await t.execute({}), { content: "שגיאה: timeout", is_error: true });
  assert.throws(() => defineTool({ name: "refund order!", description: "", schema: z.object({}), run: async () => "" }));
});
