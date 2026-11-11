import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E77.js";
const get = () => exportsOf(import.meta.url, FILE, ["ordersByCustomer","customersWithoutOrders","orphanOrders"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const customers = () => [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }, { id: 3, name: "נועה" }];
const orders = () => [{ id: 10, customerId: 2 }, { id: 11, customerId: 9 }, { id: 12, customerId: 2 }];
test("ordersByCustomer", async () => {
  const { ordersByCustomer } = await get();
  const m = ordersByCustomer(orders());
  assert.ok(m instanceof Map, "ordersByCustomer צריכה להחזיר Map");
  assert.deepEqual([...m], [[2, [10, 12]], [9, [11]]]);
  assert.equal(ordersByCustomer([]).size, 0);
});
test("customersWithoutOrders", async () => {
  const { customersWithoutOrders } = await get();
  assert.deepEqual(customersWithoutOrders(customers(), orders()), ["דנה", "נועה"]);
  assert.deepEqual(customersWithoutOrders(customers(), []), ["דנה", "עומר", "נועה"]);
  assert.deepEqual(customersWithoutOrders([], orders()), []);
});
test("orphanOrders", async () => {
  const { orphanOrders } = await get();
  assert.deepEqual(orphanOrders(customers(), orders()), [11]);
  assert.deepEqual(orphanOrders([], orders()), [10, 11, 12]);
  assert.deepEqual(orphanOrders(customers(), [{ id: 1, customerId: 3 }]), []);
});
test("עם Set", () => {
  assert.match(src(), /new\s+Set\s*\(/, "השתמש ב־Set של מזהים");
});
