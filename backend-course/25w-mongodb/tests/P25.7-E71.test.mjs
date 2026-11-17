import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

test("הזמנה, לקוח חסר, ו־404", async (t) => {
  const { ordersRouter } = await exportsOf(import.meta.url, "P25.7-E71.ts", ["ordersRouter"]);
  const { db } = await mongoSandbox(t, import.meta.url);
  const app = express();
  app.use(ordersRouter(db));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  assert.deepEqual((await call("GET", "/orders/o4")).body, {
    id: "o4", status: "delivered", createdAt: "2026-10-14T19:20:00.000Z", total: 132, customer: { id: "c3", name: "Maya Katz" },
    items: [{ productId: "p1", name: "Ethiopia Yirgacheffe", price: 62, qty: 1 }, { productId: "p8", name: "Ceramic Mug", price: 35, qty: 2 }],
  });
  await db.collection("customers").deleteOne({ _id: "c2" });
  assert.equal((await call("GET", "/orders/o2")).body.customer, null);
  const nf = await call("GET", "/orders/o99");
  assert.deepEqual([nf.status, nf.body], [404, { error: { code: "NOT_FOUND" } }]);
});
