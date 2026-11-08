import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { toProduct, listProducts } = await load(import.meta.url, "P19.5-E10.ts");

test("toProduct: מחרוזת DECIMAL ← אגורות, 0/1 ← boolean, JSON", () => {
  assert.deepEqual(toProduct({ id: 1, name: "x", price: "89.90", is_active: 1, attributes: { a: 1 } }), { id: 1, name: "x", priceCents: 8990, isActive: true, attributes: { a: 1 } });
  assert.equal(toProduct({ id: 2, name: "y", price: "0.10", is_active: 0, attributes: null }).priceCents, 10);
  assert.equal(toProduct({ id: 2, name: "y", price: "1150.70", is_active: 0, attributes: null }).isActive, false);
  assert.equal(toProduct({ id: 2, name: "y", price: "1150.70", is_active: 0, attributes: null }).priceCents, 115070);
});
test("listProducts מול MySQL אמיתי, עם ההגדרות הרגילות של mysql2", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const conn = await mysql.createConnection(db.url); // בלי decimalNumbers — כמו ברוב הפרויקטים
  t.after(() => conn.end());
  const list = await listProducts(conn, "brewing");
  assert.deepEqual(list.map((p) => [p.id, p.priceCents, p.isActive]), [[6, 11900, true], [7, 9900, true], [8, 14900, true], [11, 22900, true]]);
  assert.deepEqual(list[0].attributes, { material: "glass", cups: 8 });
  assert.equal(typeof list[0].priceCents, "number");
});
