import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t) {
  const { productsRouter } = await exportsOf(import.meta.url, "P25.7-E42.ts", ["productsRouter"]);
  const { db } = await mongoSandbox(t, import.meta.url);
  const app = express();
  app.use(productsRouter(db));
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("GET /products/:id", async (t) => {
  const call = await start(t);
  assert.deepEqual((await call("GET", "/products/p2")).body, { id: "p2", name: "Colombia Huila", category: "beans", price: 55, inStock: false });
  assert.deepEqual((await call("GET", "/products/p5")).body, { id: "p5", name: "V60 Dripper", category: "gear", price: 89, inStock: true });
  const nf = await call("GET", "/products/p99");
  assert.deepEqual([nf.status, nf.body], [404, { error: { code: "NOT_FOUND" } }]);
});
test("GET /products?category=", async (t) => {
  const call = await start(t);
  assert.deepEqual((await call("GET", "/products?category=gear")).body.map((p) => p.id), ["p7", "p6", "p5"]);
  assert.equal((await call("GET", "/products")).body.length, 8);
  assert.deepEqual((await call("GET", "/products?category[$ne]=x")).body.length, 8, "לא אופרטור");
  assert.deepEqual((await call("GET", "/products?category=tea")).body, []);
});
