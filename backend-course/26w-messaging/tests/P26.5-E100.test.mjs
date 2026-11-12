import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { upcast } = await load(import.meta.url, "P26.5-E100.ts");
const env = { id: "e-1", occurredAt: "2026-11-08T10:00:00.000Z", source: "coffee-api" };

test("v1 ← v2, עם עיגול נכון", () => {
  const v1 = { ...env, type: "order.placed", version: 1, data: { orderId: 42, email: "dana@example.com", total: 89.9 } };
  const before = structuredClone(v1);
  assert.deepEqual(upcast(v1), { ...env, type: "order.placed", version: 2, data: { orderId: 42, email: "dana@example.com", total: { amountCents: 8990, currency: "ILS" } } });
  assert.deepEqual(v1, before, "הקלט לא השתנה");
  assert.equal(upcast({ ...v1, data: { ...v1.data, total: 0.29 } }).data.total.amountCents, 29);
  assert.equal(upcast({ ...v1, data: { ...v1.data, total: 12.34 } }).data.total.amountCents, 1234);
});
test("v2 — העתק", () => {
  const v2 = { ...env, type: "order.placed", version: 2, data: { orderId: 7, email: "a@b.c", total: { amountCents: 100, currency: "USD" } } };
  const out = upcast(v2);
  assert.deepEqual(out, v2);
  assert.notEqual(out, v2);
  out.data.total.amountCents = 1;
  assert.equal(v2.data.total.amountCents, 100);
});
test("לא נתמך ← שגיאה", () => {
  assert.throws(() => upcast({ type: "order.placed", version: 3, data: {} }), /3/);
  assert.throws(() => upcast({ type: "order.placed", version: 0, data: {} }));
  assert.throws(() => upcast({ type: "order.paid", version: 1, data: {} }));
});
