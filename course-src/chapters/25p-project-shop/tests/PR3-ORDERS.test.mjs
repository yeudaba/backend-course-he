import { test } from "node:test";
import assert from "node:assert/strict";
import { shop, key } from "./_shop.mjs";

// פרויקט 3, שלב 2: עגלה ← הזמנה
test("עגלה", async (t) => {
  const { call, customer, product } = await shop(t);
  const a = await product({ name: "פילטרים", priceCents: 1990, stock: 50, category: "filters" });
  const b = await product({ name: "קומקום", priceCents: 32900, stock: 2, category: "kettles" });
  const dana = await customer();
  assert.equal((await call("GET", "/cart")).status, 401);
  assert.deepEqual((await dana("GET", "/cart")).body.items, []);
  await dana("PUT", `/cart/items/${a.id}`, { quantity: 3 });
  const cart = await dana("PUT", `/cart/items/${b.id}`, { quantity: 1 });
  assert.equal(cart.status, 200);
  assert.equal(cart.body.totalCents, 3 * 1990 + 32900);
  assert.deepEqual(cart.body.items.map((i) => [i.productId, i.quantity, i.priceCents]).sort((x, y) => x[0] - y[0]), [[a.id, 3, 1990], [b.id, 1, 32900]]);
  assert.equal((await dana("PUT", `/cart/items/${a.id}`, { quantity: 2 })).body.items.find((i) => i.productId === a.id).quantity, 2, "PUT קובע כמות (לא מוסיף)");
  const tooMany = await dana("PUT", `/cart/items/${b.id}`, { quantity: 3 });
  assert.equal(tooMany.status, 409, "יותר מהמלאי");
  assert.equal(tooMany.body.error.code, "OUT_OF_STOCK");
  assert.equal((await dana("PUT", "/cart/items/999999", { quantity: 1 })).status, 404);
  assert.equal((await dana("PUT", `/cart/items/${a.id}`, { quantity: -1 })).status, 400);
  assert.equal((await dana("DELETE", `/cart/items/${a.id}`)).status, 204);
  assert.deepEqual((await dana("GET", "/cart")).body.items.map((i) => i.productId), [b.id]);
  const yossi = await customer();
  assert.deepEqual((await yossi("GET", "/cart")).body.items, [], "לכל משתמש עגלה משלו");
});

test("הזמנה: מלאי יורד, עגלה מתרוקנת, והמחיר נשמר", async (t) => {
  const { customer, product, adminCall, orderOf, call } = await shop(t);
  const a = await product({ name: "פילטרים", priceCents: 1990, stock: 50, category: "filters" });
  const b = await product({ name: "קומקום", priceCents: 32900, stock: 2, category: "kettles" });
  const dana = await customer();
  const order = await orderOf(dana, [[a.id, 3], [b.id, 2]]);
  assert.equal(order.status, "pending_payment");
  assert.equal(order.totalCents, 3 * 1990 + 2 * 32900);
  assert.deepEqual(order.items.map((i) => [i.productId, i.name, i.priceCents, i.quantity]).sort((x, y) => x[0] - y[0]), [[a.id, "פילטרים", 1990, 3], [b.id, "קומקום", 32900, 2]]);
  assert.equal((await call("GET", `/products/${a.id}`)).body.stock, 47, "המלאי ירד");
  assert.equal((await call("GET", `/products/${b.id}`)).body.stock, 0);
  assert.deepEqual((await dana("GET", "/cart")).body.items, [], "העגלה התרוקנה");

  await adminCall("PATCH", `/products/${a.id}`, { priceCents: 2990, name: "פילטרים נייר" });
  const again = await dana("GET", `/orders/${order.id}`);
  assert.equal(again.status, 200);
  assert.equal(again.body.totalCents, order.totalCents, "שינוי מחיר מחר לא משנה הזמנה של היום");
  assert.equal(again.body.items.find((i) => i.productId === a.id).priceCents, 1990);
  assert.equal(again.body.items.find((i) => i.productId === a.id).name, "פילטרים");
});

test("אין מספיק — כלום לא קורה (rollback)", async (t) => {
  const { customer, product, call } = await shop(t);
  const a = await product({ name: "א", priceCents: 1000, stock: 10, category: "x" });
  const b = await product({ name: "ב", priceCents: 1000, stock: 1, category: "x" });
  const dana = await customer();
  const yossi = await customer();
  await dana("PUT", `/cart/items/${a.id}`, { quantity: 4 });
  await dana("PUT", `/cart/items/${b.id}`, { quantity: 1 });
  await yossi("PUT", `/cart/items/${b.id}`, { quantity: 1 });
  assert.equal((await yossi("POST", "/orders", undefined, key())).status, 201, "יוסי לקח את האחרון");
  const r = await dana("POST", "/orders", undefined, key());
  assert.equal(r.status, 409);
  assert.equal(r.body.error.code, "OUT_OF_STOCK");
  assert.deepEqual(r.body.error.details?.map((d) => [d.productId, d.requested, d.available]), [[b.id, 1, 0]], "details: מה חסר, כמה ביקשת, כמה יש");
  assert.equal((await call("GET", `/products/${a.id}`)).body.stock, 10, "גם המוצר שהיה במלאי — לא ירד (טרנזקציה)");
  assert.equal((await dana("GET", "/cart")).body.items.length, 2, "העגלה לא נמחקה");
});

test("ולידציה, Idempotency-Key, ופרטיות", async (t) => {
  const { customer, product, adminCall } = await shop(t);
  const a = await product({ stock: 10 });
  const dana = await customer();
  const empty = await dana("POST", "/orders", undefined, key());
  assert.equal(empty.status, 422);
  assert.equal(empty.body.error.code, "CART_EMPTY");
  await dana("PUT", `/cart/items/${a.id}`, { quantity: 1 });
  const noKey = await dana("POST", "/orders");
  assert.equal(noKey.status, 400, "POST /orders בלי Idempotency-Key ← 400");
  assert.equal(noKey.body.error.code, "IDEMPOTENCY_KEY_REQUIRED");

  const k = key();
  const first = await dana("POST", "/orders", undefined, k);
  const second = await dana("POST", "/orders", undefined, k);
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(second.body.id, first.body.id, "אותו מפתח ← אותה הזמנה");
  assert.equal(second.headers.get("idempotent-replayed"), "true");

  const yossi = await customer();
  const other = await yossi("GET", `/orders/${first.body.id}`);
  assert.equal(other.status, 404, "הזמנה של אחר ← 404");
  assert.equal(other.body.error.code, "ORDER_NOT_FOUND");
  assert.equal((await yossi("GET", "/orders")).body.data.length, 0, "רשימה — רק שלי");
  const mine = await dana("GET", "/orders");
  assert.deepEqual(mine.body.data.map((o) => o.id), [first.body.id]);
  assert.equal(mine.body.meta.total, 1);
  assert.ok((await adminCall("GET", "/orders")).body.data.some((o) => o.id === first.body.id), "מנהל רואה את כל ההזמנות");
});
