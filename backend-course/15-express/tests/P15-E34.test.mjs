import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E34.ts";
const data = () => [
  { id: 1, name: "מקלדת", price: 249, stock: 3 },
  { id: 2, name: "עכבר", price: 89, stock: 0 },
  { id: 3, name: "מסך", price: 899, stock: 5 },
];
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("כל המוצרים ו־X-Total-Count", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, data());
  const r = await call("GET", "/products");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, data());
  assert.equal(r.headers.get("x-total-count"), "3");
  const empty = await startApp(t, import.meta.url, FILE, []);
  assert.equal((await empty("GET", "/products")).headers.get("x-total-count"), "0");
});
test("fields", async (t) => {
  const products = data();
  const call = await startApp(t, import.meta.url, FILE, products);
  let r = await call("GET", "/products?fields=price,%20name");
  assert.deepEqual(r.body, [
    { id: 1, price: 249, name: "מקלדת" },
    { id: 2, price: 89, name: "עכבר" },
    { id: 3, price: 899, name: "מסך" },
  ]);
  assert.deepEqual(Object.keys(r.body[0]), ["id", "price", "name"], "id ראשון, ואחריו לפי הסדר שנשלח");
  assert.equal(r.headers.get("x-total-count"), "3");
  r = await call("GET", "/products?fields=stock,id,,");
  assert.deepEqual(r.body[1], { id: 2, stock: 0 });
  assert.deepEqual(Object.keys(r.body[1]), ["id", "stock"]);
  assert.deepEqual(products, data(), "המוצרים המקוריים לא השתנו");
  assert.deepEqual((await call("GET", "/products")).body, data());
});
test("שדה לא מוכר", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, data());
  let r = await call("GET", "/products?fields=name,password,secret");
  assert.deepEqual([r.status, r.body], [400, { error: "שדה לא מוכר: password" }]);
  r = await call("GET", "/products?fields=toString");
  assert.deepEqual([r.status, r.body], [400, { error: "שדה לא מוכר: toString" }]);
});
