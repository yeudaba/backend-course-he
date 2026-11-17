import { test } from "node:test";
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E47.ts";
const products = () => [
  { id: 6, name: "Electric Grinder Pro", category: "grinders", price: 649, stock: 3, is_active: true },
  { id: 5, name: "Hand Grinder", category: "grinders", price: 189, stock: 8, is_active: true },
  { id: 12, name: "Digital Scale", category: "accessories", price: 129, stock: 0, is_active: false },
  { id: 2, name: "Colombia Beans 1kg", category: "beans", price: 84.9, stock: 0, is_active: true },
];
async function start(t) {
  const { createApp } = await exportsOf(import.meta.url, FILE, ["createApp"]);
  const { base, close } = await listen(createApp(products()));
  t.after(close);
  return api(base);
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עמודות, סדר וסינון", async (t) => {
  const call = await start(t);
  let r = await call("GET", "/products");
  assert.deepEqual(r.body, [
    { id: 2, name: "Colombia Beans 1kg", price: 84.9 },
    { id: 5, name: "Hand Grinder", price: 189 },
    { id: 6, name: "Electric Grinder Pro", price: 649 },
    { id: 12, name: "Digital Scale", price: 129 },
  ]);
  assert.deepEqual(Object.keys(r.body[0]), ["id", "name", "price"]);
  assert.deepEqual((await call("GET", "/products?category=grinders")).body.map((p) => p.id), [5, 6]);
  assert.deepEqual((await call("GET", "/products?is_active=false")).body.map((p) => p.id), [12], "\"false\" מה־query מול false");
  assert.deepEqual((await call("GET", "/products?stock=0&is_active=true")).body.map((p) => p.id), [2]);
  assert.deepEqual((await call("GET", "/products?price=84.9")).body.map((p) => p.id), [2]);
  assert.deepEqual((await call("GET", "/products?category=tea")).body, []);
});
test("עמודה שלא קיימת", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/products?category=beans&colour=red&size=1");
  assert.deepEqual([r.status, r.body], [400, { error: 'column "colour" does not exist' }]);
});
