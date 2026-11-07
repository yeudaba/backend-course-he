import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseUrl } = await load(import.meta.url, "P14-E06.mjs");

test("כתובת מלאה", () => assert.deepEqual(parseUrl("http://localhost:4000/products?maxPrice=100&sort=price"), { protocol: "http", host: "localhost", port: 4000, path: "/products", query: { maxPrice: "100", sort: "price" } }));
test("port ברירת מחדל", () => {
  assert.equal(parseUrl("https://shop.co.il/a").port, 443);
  assert.equal(parseUrl("http://shop.co.il").port, 80);
  assert.equal(parseUrl("ftp://files.co.il").port, null);
});
test("path ריק הוא /, query מפוענח", () => {
  const u = parseUrl("https://shop.co.il?q=%D7%9E%D7%A1%D7%9A");
  assert.equal(u.path, "/");
  assert.deepEqual(u.query, { q: "מסך" });
});
test("כתובת לא תקינה", () => assert.throws(() => parseUrl("shop.co.il/products"), { message: "כתובת לא תקינה: shop.co.il/products" }) );
