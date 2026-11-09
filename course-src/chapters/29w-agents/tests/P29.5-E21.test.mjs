import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { connect } from "./_mcp.mjs";

const { createOrdersMcpServer } = await load(import.meta.url, "P29.5-E21.ts");
const { createStore } = await import("../files/store.ts");

test("באג 1: get_order לא מחזיר הזמנה של לקוח אחר", async (t) => {
  const { call } = await connect(t, createOrdersMcpServer(createStore(), 1));
  assert.equal((await call("get_order", { orderId: 101 })).isError, false);
  const r = await call("get_order", { orderId: 201 });
  assert.equal(r.isError, true, "הזמנה 201 שייכת ללקוח 2");
});
test("באג 2: לכל כלי — תיאור שהמודל יכול להחליט לפיו", async (t) => {
  const { client } = await connect(t, createOrdersMcpServer(createStore(), 1));
  for (const x of (await client.listTools()).tools) assert.ok((x.description ?? "").length >= 30, `${x.name}: "${x.description ?? ""}"`);
});
test("באג 3: לא מבטלים הזמנה שכבר נשלחה", async (t) => {
  const store = createStore();
  const { call } = await connect(t, createOrdersMcpServer(store, 1));
  const r = await call("cancel_order", { orderId: 102 });
  assert.equal(r.isError, true);
  assert.equal(store.orders.get(102).status, "shipped");
  assert.equal((await call("cancel_order", { orderId: 101 })).isError, false);
  assert.equal(store.orders.get(101).status, "cancelled");
  assert.equal((await call("cancel_order", { orderId: 201 })).isError, true, "וגם לא של לקוח אחר");
  assert.equal(store.orders.get(201).status, "paid");
});
