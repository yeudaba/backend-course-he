import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { createBus } = await load(import.meta.url, "P11-E24.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E24.ts"); assert.ok(r.ok, r.output); });
test("handlers לפי סוג ובסדר", () => {
  const bus = createBus();
  const seen = [];
  bus.on("order.paid", (e) => seen.push(`a${e.amount}`));
  bus.on("order.paid", (e) => seen.push(`b${e.orderId}`));
  bus.on("user.signedUp", (e) => seen.push(e.email));
  bus.emit({ type: "order.created", orderId: 7, total: 1 });
  bus.emit({ type: "order.paid", orderId: 7, amount: 120 });
  assert.deepEqual(seen, ["a120", "b7"]);
});
test("history מחזיר עותק", () => {
  const bus = createBus();
  bus.emit({ type: "user.signedUp", userId: 1, email: "x" });
  const h = bus.history();
  h.push({});
  assert.equal(bus.history().length, 1);
});
