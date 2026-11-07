import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { attachCustomers, totalsByCustomer } = await load(import.meta.url, "P07-E19.js");

const customers = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }];
const orders = [{ id: 7, customerId: 2, total: 320 }, { id: 8, customerId: 1, total: 150 }, { id: 9, customerId: 2, total: 80 }, { id: 10, customerId: 3, total: 40 }];
test("attachCustomers", () => {
  const r = attachCustomers(orders, customers);
  assert.deepEqual(r[0], { id: 7, customerId: 2, total: 320, customerName: "עומר" });
  assert.equal(r[3].customerName, null);
  assert.equal("customerName" in orders[0], false);
});
test("totalsByCustomer", () => assert.deepEqual(totalsByCustomer(orders, customers), [{ name: "עומר", total: 400 }, { name: "דנה", total: 150 }]));
