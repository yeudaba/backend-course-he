import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { code } from "./_src.mjs";

const { attachCustomers, totalsByCustomer } = await load(import.meta.url, "P07-E19.js");

const customers = [{ id: 1, name: "דנה" }, { id: 2, name: "עומר" }];
const orders = [{ id: 7, customerId: 2, total: 320 }, { id: 8, customerId: 1, total: 150 }, { id: 9, customerId: 2, total: 80 }, { id: 10, customerId: 3, total: 40 }];
test("attachCustomers", () => {
  const r = attachCustomers(orders, customers);
  assert.deepEqual(r[0], { id: 7, customerId: 2, total: 320, customerName: "עומר" });
  assert.equal(r[3].customerName, null);
  assert.equal("customerName" in orders[0], false);
});
test("totalsByCustomer — שני לקוחות עם אותו שם הם שני לקוחות", () => {
  const cs = [{ id: 1, name: "דנה" }, { id: 2, name: "דנה" }, { id: 3, name: "עומר" }];
  const os = [{ id: 1, customerId: 1, total: 100 }, { id: 2, customerId: 2, total: 60 }, { id: 3, customerId: 3, total: 120 }];
  assert.deepEqual(totalsByCustomer(os, cs), [{ name: "עומר", total: 120 }, { name: "דנה", total: 100 }, { name: "דנה", total: 60 }], "קבץ לפי id ולא לפי name");
});
test("עם Map — בלי find בתוך לולאה (המשימה)", () => {
  const src = code(import.meta.url, "P07-E19.js");
  assert.match(src, /new Map\s*\(/, "המשימה: בנה Map של לקוחות לפי id");
  assert.doesNotMatch(src, /\.find\s*\(/, "find על המערך בכל הזמנה — זו בדיוק הלולאה בתוך לולאה שהמשימה ביקשה להחליף ב־Map");
});
test("totalsByCustomer", () => assert.deepEqual(totalsByCustomer(orders, customers), [{ name: "עומר", total: 400 }, { name: "דנה", total: 150 }]));
