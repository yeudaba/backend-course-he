import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const item = (sku, qty, price) => ({ sku, qty, price });
test("הזמנה תקינה ו־total מדויק", async (t) => {
  const { OrdersModule } = exportsOf(import.meta.url, "P20-E55.ts", ["OrdersModule", "OrderItemDto", "CreateOrderDto", "OrdersController"]);
  const { call } = await nestApp(t, OrdersModule, { validation: true });
  const r = await call("POST", "/orders", { customerEmail: "a@b.co", items: [item("MUG-001", 3, 19.9), item("BEA-002", 1, 0.1), item("FIL-003", 1, 0.2)] });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { id: 1, customerEmail: "a@b.co", items: [item("MUG-001", 3, 19.9), item("BEA-002", 1, 0.1), item("FIL-003", 1, 0.2)], total: 60 });
  assert.equal((await call("POST", "/orders", { customerEmail: "c@d.co", items: [item("ABC-123", 1, 5)] })).body.id, 2);
});
test("ולידציה — גם של כל פריט", async (t) => {
  const { OrdersModule } = exportsOf(import.meta.url, "P20-E55.ts", ["OrdersModule"]);
  const { call } = await nestApp(t, OrdersModule, { validation: true });
  const ok = item("ABC-123", 1, 5);
  const bad = [
    { customerEmail: "a@b.co", items: [] },
    { customerEmail: "a@b.co", items: Array.from({ length: 21 }, (_, i) => item(`ABC-${String(100 + i)}`, 1, 1)) },
    { customerEmail: "nope", items: [ok] },
    { customerEmail: "a@b.co", items: [ok, item("ABC-124", 100, 1)] },
    { customerEmail: "a@b.co", items: [ok, item("ABC-124", 0, 1)] },
    { customerEmail: "a@b.co", items: [item("abc-123", 1, 1)] },
    { customerEmail: "a@b.co", items: [item("ABCD-12", 1, 1)] },
    { customerEmail: "a@b.co", items: [item("ABC-123", 1, 1.005)] },
    { customerEmail: "a@b.co", items: [item("ABC-123", 1, 0)] },
    { customerEmail: "a@b.co", items: [item("ABC-123", 1.5, 1)] },
    { customerEmail: "a@b.co", items: "ABC-123" },
  ];
  for (const body of bad) assert.equal((await call("POST", "/orders", body)).status, 400, JSON.stringify(body).slice(0, 120));
  const dup = await call("POST", "/orders", { customerEmail: "a@b.co", items: [ok, item("XYZ-999", 1, 1), ok] });
  assert.equal(dup.status, 400);
  assert.equal(dup.body?.message, "sku כפול: ABC-123");
  const nested = await call("POST", "/orders", { customerEmail: "a@b.co", items: [ok, item("ABC-124", 100, 1)] });
  assert.ok(JSON.stringify(nested.body).includes("items.1.qty"), "השגיאה מצביעה על הפריט: items.1.qty");
});
